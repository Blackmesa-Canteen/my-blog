---
title: Getting exit code 0xC0000409 while running QThread to update PyQt5 GUI element
  in MultiThread
slug: gettingexitcode0xc0000409whilerunningqthreadtoupdatepyqt5guielementinmultithread
date: '2022-04-05T07:21:11.411Z'
categories:
- Notes
- Utilities
tags:
- Python
- Development
- Notes
- PyQt5
original_permalink: /archives/gettingexitcode0xc0000409whilerunningqthreadtoupdatepyqt5guielementinmultithread
---

# Problem-

I was using the code below to Update GUI elements in MultiThreaded PyQt5:
```python
class HelperThread(QtCore.QThread):
    async_work_done = QtCore.pyqtSignal(object)

    def __init__(self, input_data, worker_function):
        QtCore.QThread.__init__(self)
        self.__input_data = input_data
        self.__worker_function = worker_function

    def run(self):
        try:
            res = self.__worker_function(self.__input_data)
            # emit the result of the function in work_done signal
            self.async_work_done.emit(res)
        except Exception as e:
            print("e is %s" % e)

class DemoAsyncHandler:

    def __init__(self):
        pass

    # the method called by frontend
    @staticmethod
    def async_handle_input(input_data, on_data_ready):
        """
        demo async function.

        input_data: data from front-end

        on_success: put result in this hook function if successful.
                    can use the other name, like `callback`.

        on_failure: [Optional] It is not necessary to have this param, depend on the situation

        Author Blackmesa-Canteen
        """

        # init helper thread
        thread = HelperThread(input_data=input_data,
                              worker_function=DemoAsyncHandler.__slow_calc_service)
        # attach done signal to the front-end call back function
        thread.async_work_done.connect(on_data_ready)
        # start the thread
        logger.debug("to start thread")
        thread.start()

    # define your slow logic here
    @staticmethod
    def __slow_calc_service(input_data):
        """
        This is the slow logic that need to be asynced

        :param input_data: original input data from front-end
        :return: standard R object to the front-end
        """
        # demo parse logic
        input_str = str(input_data)

        # slow logic here
        res = 'says:' + input_str
        logger.info("handled request: " + input_str)
        time.sleep(3)

        # demo condition for success decision
        is_successful = res != 'fail'
        logger.debug('done slow work')

        if is_successful:
            return R(code=status_code.SUCCESS, msg=None, data=res)
        else:
            return R(code=status_code.SUCCESS, msg=None, data=res)


class DemoFrameController(QWidget):
    def __init__(self, parent=None):
        super().__init__(parent)

        # instantiate our ui py file here
        self.__ui = DemoFrame()
        self.__ui.setupUi(self)

        # log
        logger.info('frame render successful')

        # Although we can still edit original, but it is not recommended. please edit styles in the ui py file
        self.__ui.label.setStyleSheet("color:blue")

        # button click logic
        self.__ui.Button0.clicked.connect(self.handle_button_0_click)

        # demo for some slow calculation
        self.__ui.Button1.clicked.connect(self.handle_button_1_click)

    @pyqtSlot()
    def handle_button_0_click(self):
        """
        event logic for click

        :return: null

        author: Blackmesa-Canteen
        """
        user_input = self.__ui.Edit0.text()

        # front-end logic demo, such as wrapping data into a bean, or validation
        if len(user_input) == 0 or user_input is None:
            self.__ui.FeedBackLabel.setText("NULL!")
            return

        # backend-logic calling!
        demo_handler = DemoHandler()

        # parse response variable
        # response is a R object
        response = demo_handler.handle_something(user_input)

        if not isinstance(response, R):
            logger.error('Faulty response from backend')
        else:
            if response.code == status_code.SUCCESS:
                self.__ui.FeedBackLabel.setText(response.data)
            else:
                logger.warning('something wrong with the backend')
                self.__ui.FeedBackLabel.setText('err:' + response.msg)

    @pyqtSlot()
    def handle_button_1_click(self):
        """
        Demo for some slow calc, using callback
        """
        user_input = self.__ui.Edit0.text()

        # front-end logic demo, such as wrapping data into a bean, or validation
        if len(user_input) == 0 or user_input is None:
            self.__ui.FeedBackLabel.setText("NULL!")
            return

        # backend-logic calling!
        logger.debug('try start async handle')
        DemoAsyncHandler.async_handle_input(input_data=user_input,
                                            on_data_ready=self.__some_work_callback)

        # show loading... Do other things, whatever
        self.__ui.FeedBackLabel.setText("Loading...")

    # Callback function after you finished aync job
    def __some_work_callback(self, response):
        if not isinstance(response, R):
            logger.error('Faulty response from backend')
        else:
            if response.code == status_code.SUCCESS:
                logger.debug('res rendered')
                self.__ui.FeedBackLabel.setText(response.data)
            else:
                logger.warning('something wrong with the backend')
                self.__ui.FeedBackLabel.setText('err:' + response.msg)


```

When I run it, I got exit code -1073740791 (0xC0000409). But it can be runned in the debug mode of the PyCharm.


# Solution
To correct this, I passed the parent QWidget class reference to the QThread constructor. You can see new parameter called "context" in the code.

```python
class HelperThread(QtCore.QThread):
    async_work_done = QtCore.pyqtSignal(object)

    def __init__(self, context, input_data, worker_function):
        QtCore.QThread.__init__(self, context)
        self.__input_data = input_data
        self.__worker_function = worker_function

    def run(self):
        try:
            res = self.__worker_function(self.__input_data)
            # emit the result of the function in work_done signal
            self.async_work_done.emit(res)
        except Exception as e:
            print("e is %s" % e)

class DemoAsyncHandler:

    def __init__(self):
        pass

    # the method called by frontend
    @staticmethod
    def async_handle_input(context, input_data, on_data_ready):
        """
        demo async function.

        input_data: data from front-end

        on_success: put result in this hook function if successful.
                    can use the other name, like `callback`.

        on_failure: [Optional] It is not necessary to have this param, depend on the situation

        Author Blackmesa-Canteen
        """

        # init helper thread
        thread = HelperThread(context=context, input_data=input_data,
                              worker_function=DemoAsyncHandler.__slow_calc_service)
        # attach done signal to the front-end call back function
        thread.async_work_done.connect(on_data_ready)
        # start the thread
        logger.debug("to start thread")
        thread.start()

    # define your slow logic here
    @staticmethod
    def __slow_calc_service(input_data):
        """
        This is the slow logic that need to be asynced

        :param input_data: original input data from front-end
        :return: standard R object to the front-end
        """
        # demo parse logic
        input_str = str(input_data)

        # slow logic here
        res = 'says:' + input_str
        logger.info("handled request: " + input_str)
        time.sleep(3)

        # demo condition for success decision
        is_successful = res != 'fail'
        logger.debug('done slow work')

        if is_successful:
            return R(code=status_code.SUCCESS, msg=None, data=res)
        else:
            return R(code=status_code.SUCCESS, msg=None, data=res)


class DemoFrameController(QWidget):
    def __init__(self, parent=None):
        super().__init__(parent)

        # instantiate our ui py file here
        self.__ui = DemoFrame()
        self.__ui.setupUi(self)

        # log
        logger.info('frame render successful')

        # Although we can still edit original, but it is not recommended. please edit styles in the ui py file
        self.__ui.label.setStyleSheet("color:blue")

        # button click logic
        self.__ui.Button0.clicked.connect(self.handle_button_0_click)

        # demo for some slow calculation
        self.__ui.Button1.clicked.connect(self.handle_button_1_click)

    @pyqtSlot()
    def handle_button_0_click(self):
        """
        event logic for click

        :return: null

        author: Blackmesa-Canteen
        """
        user_input = self.__ui.Edit0.text()

        # front-end logic demo, such as wrapping data into a bean, or validation
        if len(user_input) == 0 or user_input is None:
            self.__ui.FeedBackLabel.setText("NULL!")
            return

        # backend-logic calling!
        demo_handler = DemoHandler()

        # parse response variable
        # response is a R object
        response = demo_handler.handle_something(user_input)

        if not isinstance(response, R):
            logger.error('Faulty response from backend')
        else:
            if response.code == status_code.SUCCESS:
                self.__ui.FeedBackLabel.setText(response.data)
            else:
                logger.warning('something wrong with the backend')
                self.__ui.FeedBackLabel.setText('err:' + response.msg)

    @pyqtSlot()
    def handle_button_1_click(self):
        """
        Demo for some slow calc, using callback
        """
        user_input = self.__ui.Edit0.text()

        # front-end logic demo, such as wrapping data into a bean, or validation
        if len(user_input) == 0 or user_input is None:
            self.__ui.FeedBackLabel.setText("NULL!")
            return

        # backend-logic calling!
        logger.debug('try start async handle')
        DemoAsyncHandler.async_handle_input(context=self,
                                            input_data=user_input,
                                            on_data_ready=self.__some_work_callback)

        # show loading... Do other things, whatever
        self.__ui.FeedBackLabel.setText("Loading...")

    # Callback function after you finished aync job
    def __some_work_callback(self, response):
        if not isinstance(response, R):
            logger.error('Faulty response from backend')
        else:
            if response.code == status_code.SUCCESS:
                logger.debug('res rendered')
                self.__ui.FeedBackLabel.setText(response.data)
            else:
                logger.warning('something wrong with the backend')
                self.__ui.FeedBackLabel.setText('err:' + response.msg)

```

Now it can be run.
