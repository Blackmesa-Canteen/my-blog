---
title: Go服务端连接MySQL数据库的一种方法
slug: go-fu-wu-duan-lian-jie-mysql-shu-ju-ku-de-yi-zhong-fang-fa
date: '2022-01-15T00:29:59.584Z'
categories:
- Notes
- Utilities
tags:
- Development
- Database
- Go
cover: ./go-img-7b40d25b1e2a4692bf3cc0ac3ccf49f5.png
original_permalink: /archives/go-fu-wu-duan-lian-jie-mysql-shu-ju-ku-de-yi-zhong-fang-fa
---

# 依赖
- Gin框架: github.com/gin-gonic/gin
- Viper读配置文用的: github.com/spf13/viper
- gorm ORM库: github.com/go-gorm/gorm
- gorm mysql驱动: gorm.io/driver/mysql

# 码
## config/application.yaml
```yaml
server:
  port: 8081
datasource:
  driverName: mysql
  host: 127.0.0.1
  port: 3306
  database: go_api
  username: root
  password: root
  charset: utf8
  loc: Asia/Shanghai

```

## main.go
```go
func main() {
        // 初始化配置文件
	initConfig()
        // 初始化数据库, 方法在common包下的database.go里
	db := common.InitDB()
	defer db.Close()

        // 初始化默认Gin Engine
	r := gin.Default()
        // 配置中间件, Routes等
	r = CollectRoute(r)
	port := viper.GetString("server.port")
	if port != "" {
		panic(r.Run(":" + port))
	}
	panic(r.Run()) // listen and serve on 0.0.0.0:8080
}

// 设置配置文件的方法
func initConfig() {
	workDir, _ := os.Getwd()
	viper.SetConfigName("application")
	viper.SetConfigType("yml")
	viper.AddConfigPath(workDir + "/config")
	err := viper.ReadInConfig()
	if err != nil {
		panic("")
	}
}
```

## common/database.go
```go
var DB *gorm.DB

func InitDB() *gorm.DB {
        // 各种读配置文件
	driverName := viper.GetString("datasource.driverName")
	host := viper.GetString("datasource.host")
	port := viper.GetString("datasource.port")
	database := viper.GetString("datasource.database")
	username := viper.GetString("datasource.username")
	password := viper.GetString("datasource.password")
	charset := viper.GetString("datasource.charset")
	loc := viper.GetString("datasource.loc")

        // 拼凑字符串
	args := fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?charset=%s&parseTime=true&loc=%s",
		username,
		password,
		host,
		port,
		database,
		charset,
		url.QueryEscape(loc))
	fmt.Printf(args)
	db, err := gorm.Open(driverName, args)
	if err != nil {
		panic("fail to connect database, err: " + err.Error())
	}
	db.AutoMigrate(&model.User{})

	DB = db
	return db
}

// db实例的getter
func GetDB() *gorm.DB {
	return DB
}
```

## model/user.go
```go
type User struct {
	gorm.Model
	Name      string `gorm:"type:varchar(20);not null"`
	Telephone string `gorm:"varchar(11);not null;unique"`
	Password  string `gorm:"size:255;not null"`
}
```

## 一个Repository的实例
```go
type CategoryRepository struct {
	DB *gorm.DB
}

func NewCategoryRepository() CategoryRepository {
	return CategoryRepository{DB: common.GetDB()}
}

func (c CategoryRepository) Create(name string) (*model.Category, error) {
	category := model.Category{
		Name: name,
	}

	if err := c.DB.Create(&category).Error; err != nil {
		return nil, err
	}

	return &category, nil
}

func (c CategoryRepository) Update(category model.Category, name string) (*model.Category, error) {
	if err := c.DB.Model(&category).Update("name", name).Error; err != nil {
		return nil, err
	}

	return &category, nil
}

func (c CategoryRepository) SelectById(id int) (*model.Category, error) {
	var category model.Category
	if err := c.DB.First(&category, id).Error; err != nil {
		return nil, err
	}

	return &category, nil
}

func (c CategoryRepository) DeleteById(id int) error {
	if err := c.DB.Delete(model.Category{}, id).Error; err != nil {
		return err
	}

	return nil
}

```
其中, Category model是
```go
type Category struct {
	ID        uint   `json:"id" gorm:"primary_key"`
	Name      string `json:"name" gorm:"type:varchar(50);not null;unique"`
	CreatedAt Time   `json:"created_at" gorm:"type:timestamp"`
	UpdatedAt Time   `json:"updated_at" gorm:"type:timestamp"`
}
```

# 参考
请参考[gorm文档](https://gorm.io/zh_CN/docs/index.html).
