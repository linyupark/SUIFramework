/**
	高校选择器jquery 插件 v1.0
	============================
	依赖文件：school.js
	有问题请联系：linyupark@gmail.com

	弹窗内容容器：
	<div id="schoolSelector" style="display:none">
        <div class="country_list"></div>
        <div class="provs_list"></div>
        <div class="school_list"></div>
    </div>
    
    渲染文字：
    <任何标签 school-data="学校id"></任何标签>
    <任何标签 dept-data="院系id"></任何标签>
    $.renderSchool();
**/
jQuery.fn.schoolSelector = function(options) {

	var defaults = {

		// 弹窗模板定位
		containerId: 'schoolSelector',
		countryClass: 'country_list',
		provsClass: 'provs_list',
		schoolClass: 'school_list',
		boxId: 'fancybox-content',

		// 事件绑定，数据显示定位
		triggerClass: 'schools',
		schoolDisplayClass: 'selectSchool',
		schoolIdClass: 'selectSchoolId',
		departmentSelectClass: 'selectDept',

		// dom
		tpl_container: null,
		tpl_contry: null,
		tpl_provs: null,
		tpl_school: null
	};

	var param = jQuery.extend(defaults, options);

	// 模板容器对象
	param.tpl_container = $('#'+param.containerId);
	param.tpl_contry = param.tpl_container.find('.'+param.countryClass);
	param.tpl_provs = param.tpl_container.find('.'+param.provsClass);
	param.tpl_school = param.tpl_container.find('.'+param.schoolClass);

	param.tpl_container.hide();

	// 全部城市列表
	function getCountryList() {
		var l = [];
		for (i in allUnivList) {
			l[i] = allUnivList[i].name;
		}
		return l;
	}

	// 获得省列表
	function getProvinceList(country_id) {
		if (country_id == 0 || 7) {
			var l = [];
			for (i in allUnivList[country_id].provs) {
				l[i] = allUnivList[country_id].provs[i].name;
			}
			return l;
		}
		return [];
	}

	// 得到学校列表
	function getSchool(country_id, provs_id) {
		var a = [];
		if (country_id != undefined && provs_id != undefined) {
			univs = allUnivList[country_id].provs[provs_id].univs;
		} else {
			univs = allUnivList[country_id].univs;
		}
		for (i in univs) {
			a[i] = {
				id: univs[i].id,
				name: univs[i].name
			};
		}
		return a;
	}

	// 选择国家
	function selectC(country_id) {
		// 选中国家，如有州省则显示 ，没有则直接显示学校
		param.tpl_contry.find('li').removeClass('on');
		param.tpl_contry.find('li#c_' + country_id).addClass('on');
		param.tpl_provs.html('');
		param.tpl_school.html('');
		var a = getProvinceList(country_id);
		if (a.length > 0) {
			var list = '<ul>';
			for (i in a) {
				list += '<li id="p_' + i + '"><a href="#nogo" onclick="$.selectP(' + country_id + ',' + i + ');">' + a[i] + '</a></li>'
			}
			list += '</ul>';
			param.tpl_provs.html(list);
		} else {
			selectP(country_id);
		}
	}

	// 选择省
	function selectP(country_id, provs_id) {
		param.tpl_provs.find('li').removeClass('on');
		param.tpl_provs.find('li#p_' + provs_id).addClass('on');
		param.tpl_school.html('');
		var a = getSchool(country_id, provs_id);
		var list = '<ul>';
		for (i in a) {
			list += '<li id="s_' + a[i].id + '"><a href="#nogo" onclick="$.selectS(' + a[i].id + ');">' + a[i].name + '</a></li>'
		}
		list += '</ul>';
		param.tpl_school.html(list);
	}

	// 选择学校
	function selectS(school_id){
		var cu = $('.'+param.triggerClass+' .cu');
		cu.siblings('.'+param.schoolIdClass).val(school_id);
		cu.val(SCHOOL_UNIVERSITY[school_id]).change();
		cu.css({ color:'#262626', width: cu.val().length*20+'px' }); // 颜色加深
		// 院系载入
		var depts = SCHOOL_UNIVERSITY_DEPARTMENT_ID[school_id];
		var opts = '';
		for(i in depts){
			opts += '<option value="'+depts[i]+'">'+SCHOOL_UNIVERSITY_DEPARTMENT_ID2NAME[depts[i]]+'</option>'
		}
		cu.siblings('.'+param.departmentSelectClass).html(opts);
		// 取消当前操作
		cu.removeClass('cu');
		param.tpl_container.hide();
		// 是弹窗的则关闭
		if(param.boxId != param.containerId){
			$.fancybox.close();
		}
	}

	// 初始化院校选择器
	function initSchoolSelector(school_id) {
		// 国家列表
		var a = getCountryList();
		var list = '<ul>';
		for (i in a) {
			list += '<li id="c_' + i + '"><a href="#nogo" onclick="$.selectC(' + i + ');">' + a[i] + '</a></li>'
		}
		list += '</ul>';
		param.tpl_contry.html(list);
		param.tpl_provs.html('');
		param.tpl_school.html('');
		// 移除所有当前操作
		$('.'+param.triggerClass+' .cu').removeClass('cu');
		// 默认选择中国
		selectC(0);
	}

	this.each(function(){

		$this = jQuery(this);

		// 显示已有的
		school_id = $this.find('.'+param.schoolIdClass).val();
		dept_id = $this.find('.'+param.departmentSelectClass).attr('data');
		if(school_id){
			$this.find('.'+param.schoolDisplayClass).val(SCHOOL_UNIVERSITY[school_id]);
			if(dept_id != undefined){
				depts = SCHOOL_UNIVERSITY_DEPARTMENT_ID[school_id];
				opts = '';
				for(i in depts){
					opts += '<option value="'+depts[i]+'">'+SCHOOL_UNIVERSITY_DEPARTMENT_ID2NAME[depts[i]]+'</option>'
				}
				$this.find('.'+param.departmentSelectClass).html(opts).val(dept_id);
			}
		}

		// 事件绑定
		$this.find('.'+param.schoolDisplayClass).click(function(){
			initSchoolSelector();
			$(this).addClass('cu'); // 加入当前操作标示符
			if(param.boxId != param.containerId){
				$.fancybox({
					content: param.tpl_container.html()
				});
				var el = $('#'+param.boxId);
				param.tpl_contry = el.find('.'+param.countryClass);
				param.tpl_provs = el.find('.'+param.provsClass);
				param.tpl_school = el.find('.'+param.schoolClass);
			} else {
				param.tpl_container.show();
				param.tpl_container.mouseleave(function(){
					$(this).fadeOut();
				});
				param.tpl_container.insertAfter($(this));
			}
		});
	});

	jQuery.selectC = selectC;
	jQuery.selectP = selectP;
	jQuery.selectS = selectS;

	return this;

}

jQuery.renderSchool = function(){
	var school_data = $('*[school-data]');
	var dept_data = $('*[dept-data]');
	if(school_data.length > 0){ // 学校ID转名称
		school_data.each(function(){
			var school_id = $(this).attr('school-data');
			$(this).text(SCHOOL_UNIVERSITY[school_id]);
		});
	}
	if(dept_data.length > 0){ // 学院ID转名称
		dept_data.each(function(){
			var dept_id = $(this).attr('dept-data');
			$(this).text(SCHOOL_UNIVERSITY_DEPARTMENT_ID2NAME[dept_id]);
		});
	}
}