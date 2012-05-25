$(document).ready(function(){
    $('input[placeholder], textarea[placeholder]').placeholder();
});

var selectall = function(selector){
    if($(this).attr('checked') != 'checked'){
        $(this).attr('checked', 'checked');
        $(selector).each(function(){
            if($(this).attr('checked') != 'checked'){
                $(this).click();
            }
        });
    }
    else
    {
        $(this).attr('checked', '');
        $(selector).each(function(){
            if($(this).attr('checked') == 'checked'){
                $(this).click();
            }
        });
    }
};