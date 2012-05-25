# TO 前端人员的手册
<small>Last update:2012/05/25 by [linyupark](mailto:linyupark@gmail.com)</small>

### 目录&文件结构

![alt text]({../../../statics/img/pj_structor.jpg)

* 前端顶层目录 **projects**

前端人员需要关注的的目录为 **projects**，里面的子目录为平台管理员所建立的项目目录。

* 项目目录 **projects/项目目录**

项目目录名通常为项目的英文小写字母简写。

* 静态资源目录 **projects/项目目录/statics**

静态资源目录里会有一个项目子目录，比如是某项目后台页面制作则可能子目录为 **admin** ，
同理前台的皮肤颜色目录也是作为子目录存放的，项目默认会生成 **default**子目录。

子目录下存放的就是 **css、js、img、less** 这些目录，已经这些目录下对应的文件。

(less相关的操作点放在后面)

* Twig模板文件目录 **projects/项目目录/templates**

与静态资源目录类似，会有一个项目子目录，里面还包含了 **includes、layouts、macros** 三个目录。
分别对应“内嵌、布局、宏”，这里的宏可以简单理解为常用HTML代码的封装，输入参数就可以生成对应的HTML代码。

### Twig模板使用简略帮助

如果您英文不错，可以移步 [官方使用文档For前端开发人员](http://twig.sensiolabs.org/doc/templates.html)

* **简介**

一个可以提供 **变量、表达式、循环、控制** 等逻辑操作的模板引擎语言。

* **变量**

变量放在 {{ 与 }} 中间

        {{ 变量名 }}
        {{ 数组名[键] }} 或者 {{ 数组名.键 }}
        
        
本平台只是用于前台出页面效果，因此用到的变量是固定的主要包含以下：

        {{ PROJECT }} // 项目目录
        {{ FOLDER }} // 项目子目录
        {{ MODULE }} // 模块目录
        
这三个基本是一个URL地址的构成
举例一个地址为:http://xxxxx/sbs/admin/account
则sbs为项目目录;admin为子目录;account为模块目录

在模板文件中任何地方调用这三个变量都会显示当前项目相关的值，使用会非常频繁。

下面是一些跟路径相关的预设变量值：

        {{ BASE_URL }}      // 项目根地址
        {{ CUR_URL }}       // 当前页面的完整地址
        {{ Q }}             // 地址中一些查询参数跟值如http://xxxx?page=1&num=20 (问号后面部分)
        {{ CSS_URL }}       // css目录根地址
        {{ IMG_URL }}       // 图片目录根地址
        {{ JS_URL }}        // js目录根地址
        
各模块之间跳转就需要用到{{ BASE_URL }}，比如从login跳转到home页面就写：

        <a href="{{ BASE_URL }}home">跳到HOME页</a>
        
几个资源地址使用也非常简单，比如引用main.css则：

        <link rel="stylesheet" href="{{ CSS_URL }}main.css" type="text/css" />
        
最后一个预设的变量是导航相关的：

        {{ NAV.top }}        // 规定用于顶部导航
        {{ NAV.menu }}       // 规定用于侧栏菜单导航
        {{ NAV.tab }}        // 规定用于内容TAB切换导航
        
以上三个参数对应地址中 http://xxxxx?**top=xxx**、http://xxxxx?**menu=xxx**、http://xxxxx?**tab=xxx**

如果地址中没有设置，则这几个变量的值为**1**

应用举例：

        {% if NAV.menu == 2 %}
            这里仅仅当地址包含http://xxxx?menu=2时候才会显示在页面当中
        {% endif %}
        
通过这种方式就可以实现一个模块下多个页面的切换。

* **循环**

当一个HTML代码块需要多次重复显示，不需要去复制粘贴，可简单使用：

        {% for n in range(1,10) %}
        <p>这里的文字就会显示10次，目前是第{{ n }}次</p>
        {% endfor %}

* **控制**

在此平台控制主要用于控制显示哪个页面，用简单的if else 即可：

        {% if NAV.top == 1 %}
            ?top=1或者不设置top就会显示
        {% elseif NAV.top == 2 %}
            ?top=2时显示
        {% endif %}
        
* **注释**

注释的内容放在 {# 与 #} 中间

        {# 被注释掉的内容 #}


* **布局继承**

Twig模板引擎的一个强大之处就是拥有继承性，你可以设置一个基层模板，之后的模板可以在其基础上进行**填充、替换、追加**。

比如这是一个底层的模板，在此平台中凡是底层布局模板文件都放在**layouts**目录下：
        
        /* 文件名：_base.html */
        
        <html>
        <head>
            <title>{% block title %}{% endblock %}</title>
        </head>
        <body>
            <div id="hd">
                {% block hd %}
                    部分hd里面的内容
                {% endblock %}
            </div>
            
            <div id="bd">
                {% block bd %}{% endblock %}
            </div>
            
            <div id="ft">
                {% block ft %}{% endblock %}
            </div>
        </body>
        </html>
        
中间的 **block** 就是为之后继承这个模板的子模板预留的填充部位。

这是一个继承了之前模板的子模板内容：

        {% extends 'layouts/_base.html' %} <-- 这里就申明了这个模板是继承了之前_base.html这个模板
        
        {% block bd %}
            我要在<div id="bd"></div>里面写入东西，就放在这个block下面就行了，要跟底层模板的block名称对应
        {% endblock %}
        
如果要追加内容，则要用到 **{{ parent() }}** 方法：

        
        {% extends 'layouts/_base.html' %} <-- 这里就申明了这个模板是继承了之前_base.html这个模板
        
        {% block hd %}
            追加在前面
            {{ parent() }} <--这里会显示“部分hd里面的内容”
            追加在后面
        {% endblock %}



























