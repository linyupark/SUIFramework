/**
 * 地区JS插件@linyu
 * select 使用：
 * <span class="area">
        <select name="country" class="select_c select_attr" data-c="0">
        </select>
        <select name="province" class="select_p select_attr"  data-p="29">
        </select>
        <select name="city" class="select_r select_attr" data-r="0">
        </select>
    </span>
    $('.area').areaSelector();
    文字渲染：
    <em area-data="0-0-0"></em>
	$.renderArea('-');
 * */
jQuery.fn.areaSelector = function(options){

	var defaults = {
		countryClass: 'select_c', // 对应数据的select
		provinceClass: 'select_p',
		regionClass: 'select_r',

		countryText: '- 国家 -', // 默认显示在select上的名字，下面相同
		provinceText: '- 省市州 -',
		regionText: '- 地区 -',

		shortCut: true,

		countryDOM: null,
		provinceDOM: null,
		regionDOM: null,

		cid: null,
		pid: null,
		rid: null
	}

	var param = jQuery.extend(defaults, options);

	var _country_options = function(){
		op = '<option value="-1">'+param.countryText+'</option>';
		for(i in dsy.Items[0]){
			selected = param.cid == i ? 'selected="selected"':'';
			op += '<option value="'+i+'" '+selected+'>'+dsy.Items[0][i]+'</option>';
		}
		return op;
	}

	var _province_options = function(){
		op = '<option value="-1">'+param.provinceText+'</option>';
		for(i in dsy.Items['0_'+param.cid]){
			selected = param.pid == i ? 'selected="selected"':'';
			op += '<option value="'+i+'" '+selected+'>'+dsy.Items['0_'+param.cid][i]+'</option>';
		}
		return op;
	}

	var _region_options = function(){
		op = '<option value="-1">'+param.regionText+'</option>';
		for(i in dsy.Items['0_'+param.cid+'_'+param.pid]){
			selected = param.rid == i ? 'selected="selected"':'';
			op += '<option value="'+i+'" '+selected+'>'+dsy.Items['0_'+param.cid+'_'+param.pid][i]+'</option>';
		}
		return op;
	}

	var _country_change = function(){
		param.countryDOM.css({width:'auto'});
		param.cid = param.countryDOM.val();
		param.provinceDOM.html(_province_options());
		param.provinceDOM.css({width:'auto'});
		param.regionDOM.html(_region_options());
		param.regionDOM.css({width:'auto'});
		// 忽略国外省市州
		if(param.shortCut == true && param.cid > 0){
			param.provinceDOM.hide();
			param.regionDOM.hide();
			
		} else {
			param.provinceDOM.show();
			param.regionDOM.show();
		}
	}

	var _province_change = function(){
		param.pid = param.provinceDOM.val();
		param.regionDOM.html(_region_options());
		param.regionDOM.css({width:'auto'});
	}

	this.each(function(){

		$this = jQuery(this);

		// 锁定操作对象
		param.countryDOM = $this.find('.'+param.countryClass);
		param.provinceDOM = $this.find('.'+param.provinceClass);
		param.regionDOM = $this.find('.'+param.regionClass);

		// 初始化选框内容
		setC = param.countryDOM.attr('data-c');
		setP = param.provinceDOM.attr('data-p');
		setR = param.regionDOM.attr('data-r');
		
		param.cid = setC;
		param.pid = setP;
		param.rid = setR;
		
		// 初始化国家
		param.countryDOM.html(_country_options());
		var c_len = param.countryDOM.find('option:selected').text().length;
		param.countryDOM.css({width: (60+c_len*12+'px')});
		param.countryDOM.change(_country_change);
		
		// 省份
		param.provinceDOM.html(_province_options());
		var p_len = param.provinceDOM.find('option:selected').text().length;
		param.provinceDOM.css({width: (60+p_len*12+'px')});
		param.provinceDOM.change(_province_change);
		
		// 地区
		param.regionDOM.html(_region_options());
		var r_len = param.regionDOM.find('option:selected').text().length;
		param.regionDOM.css({width: (60+r_len*12+'px')});
	});
	
	return this;
}

jQuery.renderArea = function(sp){
	var area = [];
	$('em[area-data]').each(function(){
		data = $(this).attr('area-data');
		arr = data.split(sp);
		area[0] = dsy.Items[0][arr[0]];
		if(arr[1] != undefined) area[1] = dsy.Items['0_'+arr[0]][arr[1]];
		if(arr[2] != undefined) area[2] = dsy.Items['0_'+arr[0]+'_'+arr[1]][arr[2]];
		$(this).text(area.join(' - '));
	});
}