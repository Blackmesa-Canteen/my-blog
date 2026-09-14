---
title: Implement One-time Password 2FA with Django RESTful API backend + JWT
slug: implementone-timepassword2fawithreactrefinedjangorestfulapijwt
date: '2023-07-27T02:29:47.822Z'
categories:
- Notes
- Improvement
tags:
- Python
- Development
- Django
- 2FA
- JWT
original_permalink: /archives/implementone-timepassword2fawithreactrefinedjangorestfulapijwt
---

# Intro
Attach OTP 2FA as an optional authentication to a project with  Python Django as RESTful backend API. Using JWT for auth.

# Backend
## 0. Dependencies:
0.1. run `pipenv install django_otp`
0.2. Installed APPs
```python
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'django_otp',
    'django_otp.plugins.otp_totp',
] 
```
0.3. MIDDLEWARE
```python
MIDDLEWARE = [
    'django.middleware.common.CommonMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django_otp.middleware.OTPMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
]
```

0.4. Migration
```bash
python manage.py makemigrations
python manage.py migrate
```


## 2. Added db models: `models.py`
```python
from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone


# Util class for auto updating the updated_at field
class _AutoDateTimeField(models.DateTimeField):
    def pre_save(self, model_instance, add):
        return timezone.now()


class UserOauthProfile(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='oauth_profiles')
    oauth_service_name = models.CharField(max_length=100)
    oauth_url = models.URLField()
    oauth_credentials = models.TextField()

    def __str__(self):
        return "%s, %s" % (self.oauth_service_name, self.oauth_credentials)
        
class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    email = models.CharField(max_length=128, null=False)
    phone = models.CharField(max_length=64, null=False)
    first_name = models.CharField(max_length=128, null=False)
    last_name = models.CharField(max_length=128, null=False)
    created_at = models.DateTimeField(null=False, default=timezone.now)
    updated_at = _AutoDateTimeField(null=False, default=timezone.now)

    power_account_id = models.IntegerField(null=False, default=0)
    power_contact_id = models.IntegerField(null=False, default=0)

    is_otp_enabled = models.BooleanField(null=False, default=False)

    def __str__(self):
        return self.user
```

## 3. Add serializers: `serializers.py`
```python
class UserProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = UserProfile
        fields = '__all__'
        
class UserOauthProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserOauthProfile
        fields = ('id', 'user', 'oauth_service_name', 'oauth_url', 'oauth_credentials')

class UserSerializer(serializers.ModelSerializer):
    oauth_profiles = UserOauthProfileSerializer(many=True, read_only=True)

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'oauth_profiles')


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        # Add custom claims
        token = add_jwt_extra_otp_payload_fields(user, token)

        return token
```
## 4. Utils: `utils.py`
```python
from datetime import datetime
from calendar import timegm
from django.conf import settings

import jwt
from django_otp.models import Device
from rest_framework_simplejwt.settings import api_settings
from rest_framework_simplejwt.tokens import RefreshToken


# generate a new jwt token, that contains extra device info
def generate_jwt_with_otp_info(device, user):
    # generate a new token, that contains device info
    refresh = RefreshToken.for_user(user)

    # Obtain the access token
    access_token = gen_jwt_otp_token_based_on_original_token(
        token=str(refresh.access_token),
        device=device
    )
    # Obtain the refresh token
    refresh_token = gen_jwt_otp_token_based_on_original_token(
        token=str(refresh),
        device=device
    )
    response_json = {
        'refresh': refresh_token,
        'access': access_token
    }
    return response_json


def get_token_from_request(request):
    auth_header = request.META.get('HTTP_AUTHORIZATION')

    if auth_header and auth_header.startswith('Bearer '):
        # Extract the token from the "Bearer" authorization header
        return auth_header[7:]  # Remove "Bearer " prefix

    return None


def add_jwt_extra_otp_payload_fields(user, payload, device=None):
    """
    Optionally include OTP device in JWT payload
    """

    # Custom additions: add otp related info
    if user is not None and device is not None and device.user_id == user.id and device.confirmed:
        payload['otp_device_id'] = device.persistent_id
    else:
        payload['otp_device_id'] = None

    return payload


def gen_jwt_otp_token_based_on_original_token(token, device=None):
    """
    Generate a new token based on the original token, with otp_device_id
    """
    # decode the original token
    decoded_token = jwt.decode(token, key=settings.SECRET_KEY, algorithms=['HS256'])

    # add custom fields in response
    if device is not None:
        decoded_token['otp_device_id'] = device.persistent_id
    else:
        decoded_token['otp_device_id'] = None

    # generate a new token
    new_token = jwt.encode(decoded_token, key=settings.SECRET_KEY, algorithm='HS256')

    return new_token


def is_verified_jwt_otp_token_from_request(request):
    token_string = get_token_from_request(request)
    if token_string is None:
        return False

    try:
        decoded_token = jwt.decode(token_string, key=settings.SECRET_KEY, algorithms=['HS256'])
        persistent_id = decoded_token['otp_device_id']
        if persistent_id is None:
            return False

        device = Device.from_persistent_id(persistent_id)

        if device is None or device.user_id != request.user.id:
            return False

    except Exception as e:
        return False

    return True

```
## 5. Permissions:  `permissions.py`

```python
from rest_framework import permissions
from django_otp import user_has_device

from accounts.utils import is_verified_jwt_otp_token_from_request


class IsOtpVerified(permissions.BasePermission):
    """
    If user has verified TOTP device, require TOTP OTP.
    """
    message = "You do not have permission to perform this action until you verify your MFA device."

    def has_permission(self, request, view):
        if user_has_device(request.user):
            return is_verified_jwt_otp_token_from_request(request)
        else:
            return True

```

## 6. Add API Views: `otp_views.py`:
```python
from rest_framework import views, permissions
from rest_framework.response import Response
from rest_framework import status
from django_otp import devices_for_user
from django_otp.plugins.otp_totp.models import TOTPDevice
from rest_framework_simplejwt.tokens import RefreshToken

from accounts.permissions import IsOtpVerified
from accounts.utils import gen_jwt_otp_token_based_on_original_token, generate_jwt_with_otp_info
from django_otp.plugins.otp_static.models import StaticDevice, StaticToken

from account.models import UserProfile


# https://medium.com/@ksarthak4ever/django-two-factor-authentication-2ece42748610

# recovery code helper
def get_user_static_device(self, user, confirmed=None):
    devices = devices_for_user(user, confirmed=confirmed)
    for device in devices:
        if isinstance(device, StaticDevice):
            return device


def get_user_totp_device(self, user, confirmed=None):
    devices = devices_for_user(user, confirmed=confirmed)
    for device in devices:
        if isinstance(device, TOTPDevice):
            return device


# check user has enabled otp or not
class CheckOtpEnabledView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, format=None):
        user = request.user
        device = get_user_totp_device(self, user)
        if not device:
            return Response({'isOtpEnabled': False}, status=status.HTTP_200_OK)
        else:
            if device.confirmed:
                return Response({'isOtpEnabled': True}, status=status.HTTP_200_OK)
            else:
                return Response({'isOtpEnabled': False}, status=status.HTTP_200_OK)


class TOTPCreateView(views.APIView):
    """
    Use this endpoint to set up a new TOTP device
    """
    permission_classes = [permissions.IsAuthenticated]
    number_of_static_tokens = 5

    def get(self, request, format=None):
        user = request.user
        device = get_user_totp_device(self, user)
        if not device:
            device = user.totpdevice_set.create(confirmed=False)
        url = device.config_url

        # create static recovery codes
        static_device = get_user_static_device(self, request.user)
        if not static_device:
            static_device = StaticDevice.objects.create(user=request.user, name="Static")

        static_device.token_set.all().delete()
        tokens = []
        for n in range(self.number_of_static_tokens):
            token = StaticToken.random_token()
            static_device.token_set.create(token=token)
            tokens.append(token)

        res = {
            'message': 'OTP device created successfully',
            'otpUrl': url,
            'recoveryCodes': tokens
        }

        return Response(res, status=status.HTTP_201_CREATED)


class TOTPVerifyView(views.APIView):
    """
    Api to verify/enable a TOTP device, if success, generate a new token
    """
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request):
        data = request.data
        auth_token = data.get('token')
        if not auth_token:
            return Response({'message': 'Request body `token` should not be null'}, status=400)
        user = request.user
        device = get_user_totp_device(self, user)
        if not device:
            return Response(dict(
                errors=['This user has not setup two factor authentication']),
                status=status.HTTP_400_BAD_REQUEST
            )
        if device is not None and device.verify_token(token=auth_token):
            if not device.confirmed:
                device.confirmed = True
                device.save()
                # update user profile
                UserProfile.objects.filter(user=user).update(is_otp_enabled=True)

            response_json = generate_jwt_with_otp_info(device=device, user=user)

            return Response(response_json, status=status.HTTP_200_OK)
        else:

            return Response({'message': 'Invalid 2FA token, or invalid 2FA device.'}, status=400)


class StaticOtpDeviceCreateView(views.APIView):
    """
    Use this endpoint to create static recovery codes.
    """
    permission_classes = [permissions.IsAuthenticated, IsOtpVerified]
    number_of_static_tokens = 5

    def get(self, request, format=None):
        device = get_user_static_device(self, request.user)
        if not device:
            device = StaticDevice.objects.create(user=request.user, name="Static")

        device.token_set.all().delete()
        tokens = []
        for n in range(self.number_of_static_tokens):
            token = StaticToken.random_token()
            device.token_set.create(token=token)
            tokens.append(token)

        return Response(tokens, status=status.HTTP_201_CREATED)


class StaticOtpDeviceVerifyView(views.APIView):
    """
    Use this endpoint to verify a static token.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, format=None):
        data = request.data
        auth_token = data.get('token')
        if not auth_token:
            return Response({'message': 'Request body `token` should not be null'}, status=400)
        user = request.user
        device = get_user_static_device(self, user)
        if device is not None and device.verify_token(token=auth_token):
            response_json = generate_jwt_with_otp_info(device=device, user=user)
            return Response(response_json, status=status.HTTP_200_OK)
        else:

            return Response({'message': 'Invalid 2FA recovery Token.'}, status=400)


class TOTPRollBackView(views.APIView):
    """
    Use this endpoint to cancel a TOTP setup transaction
    """
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request):
        user = request.user
        device = get_user_totp_device(self, user)
        if not device:
            return Response(dict(
                errors=['This user has not pre-setup two factor authentication']),
                status=status.HTTP_400_BAD_REQUEST
            )

        if not device.confirmed:
            # delete recovery static devices
            devices = devices_for_user(user)
            for theDevice in devices:
                theDevice.delete()

            # delete otp device
            device.delete()
            return Response({"message": "Setup 2FA Cancelled."}, status=status.HTTP_200_OK)
        else:
            return Response({"message": "2FA is already enabled, please disable it first."})


class TOTPDeleteView(views.APIView):
    """
    Use this endpoint to delete a TOTP device
    """
    permission_classes = [permissions.IsAuthenticated, IsOtpVerified]

    def delete(self, request):
        user = request.user
        devices = devices_for_user(user)
        for device in devices:
            device.delete()
        response_json = generate_jwt_with_otp_info(device=None, user=user)

        # update User Profile
        UserProfile.objects.filter(user=user).update(is_otp_enabled=False)

        return Response(response_json, status=status.HTTP_200_OK)
```
## 7. Other API Views: `views.py`
```python
from rest_framework_simplejwt.views import TokenObtainPairView
from accounts.serializers import CustomTokenObtainPairSerializer

# generate a login access token with customized payload
class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

```
## 8. URL: `urls.py`
```python
urlpatterns = [

    ... (Other urls)
    
    # Customized JWT token auth API
    path('token', MyTokenObtainPairView.as_view(), name='token_obtain_pair'),

    # totp MFA related
    # create totp
    path('totp/create', TOTPCreateView.as_view(), name='totp-create'),
    # cancel a totp setup transaction
    path('totp/rollback', TOTPRollBackView.as_view(), name='totp-rollback'),
    # verify/login with totp
    # re_path(r'^totp/login/(?P<token>[0-9]{6})/$', TOTPVerifyView.as_view(), name='totp-login'),
    path('totp/login', TOTPVerifyView.as_view(), name='totp-login'),

    # create/login with otp recovery codes
    path('totp/recovery_code/create', StaticOtpDeviceCreateView.as_view(), name='totp-recovery-code-create'),
    path('totp/recovery_code/login', StaticOtpDeviceVerifyView.as_view(), name='totp-recovery-code-verify'),

    # delete otp devices
    path('totp/delete', TOTPDeleteView.as_view(), name='totp-delete'),

    # check otp status for current login user
    path('totp/status', CheckOtpEnabledView.as_view(), name='totp-status'),
]
```
