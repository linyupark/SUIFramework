<?php

/**
 * SUIFramework 前端项目工作框架
 * 环境要求 PHP5+ / Apache / SQLite
 * @author linyu@eetop.com
 * @version 1.0
**/

# 全局设置
define('ROOT', dirname($_SERVER['SCRIPT_FILENAME']).'/');
define('SITE_ROOT', dirname($_SERVER['SCRIPT_NAME']).'/');
define('SUI_VERSION', '1.0');
define('ADMIN_ROLE', 'sui_role');
define('ADMIN_PASSWORD', 'linyu');								# 管理密码
define('SUI_TABLENAME', 'sui_projects');						# 存储SUI项目的数据表名称
define('PJ_DEFAULT_FOLDER', 'default'); 						# 项目默认的皮肤目录


# 微PHP框架
# SlimPHP
require 'Library/Slim/Slim.php';
$app = new Slim();
class S {
	public static function app()
	{
		return Slim::getInstance();
	}
	
	public static function refresh()
	{
		self::app()->redirect($_SERVER['REQUEST_URI']);
	}
}

# 模板引擎
# twig (http://twig.sensiolabs.org/doc/api.html)
require 'Library/Twig/Autoloader.php';
Twig_Autoloader::register();
class T {
	protected static $loader;
	public static $paths = array();
	public static $g = array();
	public static $twig;
	
	public static function path($uri)
	{
		if(!in_array($uri, self::$paths))
		{
			 self::$paths[] = $uri;
		}
		self::setup();
	}
	
	public static function setup()
	{
		self::$loader = new Twig_Loader_Filesystem(self::$paths);
		self::$twig = new Twig_Environment(self::$loader, array('autoescape' => false));
		self::$twig->addGlobal('_flash', @$_SESSION['flash']);
		self::$twig->addGlobal('_post', $_POST);
		self::$twig->addGlobal('_get', $_GET);
		self::$twig->addGlobal('_site', SITE_ROOT);
		self::$twig->addGlobal('_login', isset($_SESSION[ADMIN_ROLE]));
	}
    public static function g($k, $v)
    {
        self::$g[$k] = $v;
        self::$twig->addGlobal('g', self::$g);
    }
	public static function render($template, $context=array())
	{
		$t = self::$twig->loadTemplate($template);
		return $t->render($context);
	}
}
T::path(ROOT.'templates');

# MARKDOWN 文字格式化语言
require 'Library/markdown.php';
T::$twig->addFilter('markdown', new Twig_Filter_Function('Markdown'));

# 单文件数据库操作类
# redbean (http://www.redbeanphp.com/manual/)
require 'Library/rb.php';
R::setup('sqlite:suiframework.db');

# CSS编程化语言{Less}的PHP编译类
# http://leafo.net/lessphp/#documentation
require 'Library/lessc.inc.php';

# 404 页面
$app->notFound('custom_not_found_callback');
function custom_not_found_callback()
{
    echo T::render('404.html');
}

# 身份校验钩子
$app->hook('login.required', 'login_required');
function login_required()
{
	if(!isset($_SESSION[ADMIN_ROLE]))
	{
		S::app()->flash('info', '请登录后再进行该操作');
		S::app()->redirect(SITE_ROOT);
	}
}

# 创建项目目录
function sui_create_project($project, $folder)
{
	S::app()->applyHook('login.required');
	
	$statics = "statics/{$folder}/";
	$templates = "templates/{$folder}/";
	
	// 创建目录
	$folders = array(
		$statics.'css',
		$statics.'img',
		$statics.'js',
		$statics.'less',
		$templates.'includes',
		$templates.'layouts',
		$templates.'macros',
	);
	foreach($folders as $f)
	{
		$folder_path = "/projects/{$project}/{$f}";
		if(!is_dir(ROOT.$folder_path))
		{
			mkdir(ROOT.$folder_path, 0777, true);
		}
	}
	
	// 基础布局文件复制
	$src_list = array(
		'/templates/copy/_base.html',
		'/templates/copy/index.html',
	);
	$dest_list = array(
		$templates.'layouts/_base.html',
		$templates.'/index.html',
	);
	foreach($dest_list as $i => $dest)
	{
		if(!file_exists(ROOT.$dest)){
			copy(ROOT.$src_list[$i], ROOT."/projects/{$project}/{$dest}");
		}
	}
}

# 扫项目子目录，提供目录链接
function fetch_sub_folders($project)
{
	$project_dir = ROOT.'projects/'.$project.'/templates';
	$folders = array();
	if(is_dir($project_dir))
	{
		$dirs = scandir($project_dir);
		if(count($dirs) > 2)
		{
			foreach($dirs as $dir)
			{
				if(!in_array($dir, array('.', '..', '.svn')))
				{
					$folders[] = $dir;
				}
			}
		}
	}
	return $folders;
}

# Less自动编译css
function auto_compile_less($less_fname, $css_fname)
{
	if(isset($_GET['less']))
	{
		$cache = lessc::cexecute($less_fname);
		file_put_contents($css_fname, $cache['compiled']);
	}
}

# 首页（项目列表、创建、改动）
$app->map('/', 'sui_start')->via('GET', 'POST');
function sui_start()
{
	if(S::app()->request()->isPost())
	{
		S::app()->applyHook('login.required');
		$post = S::app()->request()->post();
		$post['name'] = trim(@$post['name']);
		$post['folder'] = trim(@$post['folder']);
		
		if($post['name'] != '' && $post['folder'] != '')
		{
			$is_exist = R::findOne(SUI_TABLENAME,
								   'name = ? OR folder = ?',
								   array($post['name'], $post['folder']));
			if(!$is_exist)
			{
				$new_project = R::dispense(SUI_TABLENAME);
				$new_project->name = $post['name'];
				$new_project->folder = $post['folder'];
				R::store($new_project);
				
				// 创建目录
				sui_create_project($post['folder'], PJ_DEFAULT_FOLDER);
				
				S::app()->flash('success', "新项目{$post['name']}创建成功");
			}
			else
			{
				S::app()->flash('error', "相同命名的项目{$post['name']}已经存在");
			}
		}
		else
		{
			S::app()->flash('error', '请输入 项目名称 跟 目录名称');
		}
		
		S::refresh();
	}
	
	// 项目列表
	$project_list = R::findAll(SUI_TABLENAME, 'order by id desc');
	$sub_folders = array();
	if(count($project_list) > 0)
	{
		foreach($project_list as $p)
		{
			$sub_folders[$p['folder']] = fetch_sub_folders($p['folder']);
		}
	}
	
	$context = array(
		'title' => '欢迎使用 SUIFramework v'.SUI_VERSION,
		'project_list' => $project_list,
		'sub_folders' => $sub_folders,
	);
	
	echo T::render('home.html', $context);
}

# 静态文档
$app->get('/read_page/:page', 'sui_page');
function sui_page($page)
{
	$page_file = false;
	
	if(file_exists(ROOT.$page.'.log'))
	{
		$page_file = ROOT.$page.'.log';
	}
	if(file_exists(ROOT.$page.'.txt'))
	{
		$page_file= ROOT.$page.'.txt';
	}
	if($page_file)
	{
		echo T::render('page.html', array('content' => file_get_contents($page_file)));
	}
}

# 输入密码
$app->map('/sui_login', 'sui_login')->via('GET', 'POST');
function sui_login()
{
	$do = S::app()->request()->get('do');
	
	if($do == 'exit')
	{
		unset($_SESSION[ADMIN_ROLE]);
		S::app()->flash('success', '成功退出');
		S::app()->redirect(SITE_ROOT);
	}
	
	if(S::app()->request()->isPost())
	{
		$password = S::app()->request()->post('password');
		if($password == ADMIN_PASSWORD)
		{
			S::app()->flash('success', '登录成功');
			$_SESSION[ADMIN_ROLE] = TRUE;
		}
		else
		{
			S::app()->flash('error', '口令错误');
		}
	}
	S::app()->redirect(SITE_ROOT);
}

# 内容改动记录
$app->map('/changelog/:project', 'sui_changelog')->via('GET', 'POST');
function sui_changelog($project)
{
	$project_obj = R::findOne(SUI_TABLENAME, 'folder = ?', array($project));
	
	if(!$project_obj)
	{
		S::app()->flash('success', '成功退出');
		S::app()->redirect(SITE_ROOT);
	}
	
	$bean = $project.'_changelog';
	$post = S::app()->request()->post();
	$edit_id = S::app()->request()->get('edit');
	$del_id = S::app()->request()->get('del');
	
	# 编辑
	if($edit_id)
	{
		$edit_log = R::load($bean, $edit_id);
		$log = $edit_log;
	}
	
	# 删除
	if($del_id)
	{
		$del_log = R::load($bean, $del_id);
		if($del_log->id) R::trash($del_log);
	}
	
	# 新建
	if(S::app()->request()->isPost())
	{
		S::app()->applyHook('login.required');
		
		$content = trim($post['content']);
		$number = $post['number'];
		$date = isset($log['date']) ? $log['date'] : date('y-m-d H:i');
		
		if($content != '' && !isset($log))
		{
			$log = R::dispense($bean);
			$number = $post['number'] +1;
		}
		
		if($content == '')
		{
			S::app()->flash('error', '请输入内容');
			S::refresh();
		}
		else
		{
			$log->date = $date;
			$log->number = $number;
			$log->content = $content;
			$id = R::store($log);
			S::app()->flash('success', '操作成功');
		}
		
		if($id == $edit_id)
		{
			S::app()->redirect(SITE_ROOT.'changelog/'.$project.'#');
		}
		
		S::refresh();
	}
	
	$log_list = R::findAll($bean, 'order by number desc');
	$first_log = current($log_list);
	
	$context = array(
		'project' => $project,
		'title' => '改动记录:'.$project,
		'log_list' => $log_list,
		'first_log' => $first_log,
		'edit_log' => @$edit_log,
		'project' => $project_obj,
	);

	echo T::render('changelog.html', $context);
}

# 项目视图组
$app->map('/:project(/:folder(/:module))', 'sui_views')->via('GET', 'POST');
function sui_views($project, $folder=PJ_DEFAULT_FOLDER, $module='')
{
	$project_root = ROOT."projects/{$project}/";
	$project_url = SITE_ROOT."projects/{$project}/";
	
	// 模板路径
	T::path("{$project_root}templates/{$folder}");

	// 静态文件 url
	$statics = "{$project_url}statics/{$folder}/";
	$statics_root = "{$project_root}statics/{$folder}/";
	
	$get = S::app()->request()->get();
	$nav['top'] = isset($get['top']) ? $get['top'] : 1;
	$nav['menu'] = isset($get['menu']) ? $get['menu'] : 1;
	$nav['tab'] = isset($get['tab']) ? $get['tab'] : 1;
	
	// 根据folder来touch对应的{less}文件
	touch("{$statics_root}less/main.less");
	
	auto_compile_less("{$statics_root}less/main.less", "{$statics_root}css/main.css");
	
	// 路径补足
	$folder .= '/';
	if($module == '') $module = '/index';
	
	$context = array(
		'PROJECT' => $project,
		'FOLDER' => $folder,
		'MODULE' => $module,
		'NAV' => $nav,
		'BASE_URL' => SITE_ROOT . "{$project}/{$folder}",
		'CSS_URL' => $statics . 'css/',
		'IMG_URL' => $statics . 'img/',
		'JS_URL' => $statics . 'js/',
		'STIME' => time(),
		'CUR_URL' => $_SERVER['REQUEST_URI'],
		'Q' => $_SERVER['QUERY_STRING'],
	);

	echo T::render($module.'.html', $context);
}



$app->run();

