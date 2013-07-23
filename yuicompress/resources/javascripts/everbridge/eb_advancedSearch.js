/**
 * Advanced Search
 * Linder Wang date : 2012-12-26
 * create instance
   var advancedSearch = EB_Common.advancedSearch.initialize({
        context: '',
        url : '',
        callback : {
            search : function(conditions){

            }
         }
    });
  * load
    advancedSearch.load('advancedSearchContainId');
 */
(function(common) {
    $.extend(common, {
        // constructor for Advanced Search
        /**
         * 
         * @param {type} config
           config = {
             url : '',
             context:'',
             submitInputs : [],
             fieldReader : {},
             dataType : {},
             callback : {
                search : function
                close : function
             }
           }
         * @returns ''
         */
        advancedSearch: function(config) {
            this.settings = $.extend(true, {}, common.advancedSearch.defaults, config);
            this.filterCondition = {};//cache option data
            this.addedCondition = {};//When we added the condition,the var will be push a value. When we deleted the condition,the var will be pull a value. 
            this.filterIndex = 0;
            this.initTmpl();
            this.init();
        }
    });

    $.extend(common.advancedSearch, {
        advancedSearchCt : 'advanced_search_ct_',
        advancedSearchCtId : 1,//global, the advaced search contain id
        defaults: {
            context: '',
            url: '',
            filterGen : 'advanced_search_',
            submitInputs:['id','dataType','name'],//When the users click the search,these value of the inputs will be sumbited.
            fieldReader: {
                attributeId: 'id',
                fieldName: 'name',
                displayFieldName : 'displayFieldName',
                dataType: 'dataType',
                valueItems : 'valueItems'
            },
            dataType: {
                textField: 'string',
                dateTimeField: 'date',
                singleSelect : 'single',
                multipleSelect: 'multiple'
            },
            callback :{
        
            }
        },
        prototype: {
            //private
            initTmpl: function() {
                var dataType = this.settings.dataType;
                var tmpl = '<div class="advanced-search-item">'
                        + '{{each(i, input) submitInputs}}<input type="hidden" name="${input.text}" value="${input.value}"> {{/each}}'
                        + '<input type="text" name="displayName" readonly="readonly" class="input" value="${optionData.displayField}">'
                        + '<select class="select" name="operator">'
                        + '{{each(i, option) options}}<option value="${option.value}">${option.text}</option> {{/each}}'
                        + '</select>'
                        + '<span>'
                        + '{{if optionData.dataType == "' + dataType.textField + '" }}'
                        + '<input type="text" name="fieldValue" class="input_width250 {required:true}">'
                        + '{{/if}}'
                        + '{{if optionData.dataType == "' + dataType.dateTimeField + '" }}'
                        + '<input type="text" name="fieldValue" class="input_width250 {required:true}">'
                        + '{{/if}}'
                        + '{{if optionData.dataType == "' + dataType.singleSelect + '" }}'
                        + '<select name="fieldValue" class="input_width250 {required:true}">'
                        + '{{each(i, option) optionData.valueItems}}<option value="${option.value}">${option.text}</option> {{/each}}'
                        + '</select>'
                        + '{{/if}}'
                        + '{{if optionData.dataType == "' + dataType.multipleSelect + '" }}'
                        + '<select name="fieldValue" class="select-multiple {required:true}" multiple="multiple">'
                        + '{{each(i, option) optionData.valueItems}}<option value="${option.value}">${option.text}</option> {{/each}}'
                        + '</select>'
                        + '{{/if}}'
                        + '<a href="#" class="icn_trash_16"></a>'
                        + '</span></div>';
                $.template('conditionTmpl', tmpl);
            },
            
            //private
            init: function() {
                //load tabs 
                EB_Common.Ajax.get('/statics/tmpl/common/advancedSearch.html', {}, function(data) {
                    $.template('advancedSearchTmpl', data);
                }, 'html');
                this.settings.i18n = {
                    search: i18n['contact.text.advanced.search'],
                    field: i18n['contact.advancesearch.header.title.field'],
                    condition: i18n['contact.advancesearch.header.title.condition'],
                    titleValue: i18n['contact.advancesearch.header.title.value'],
                    filter: i18n['global.add.filter'],
                    optionDefault: i18n['button.select.advancesearch.default'],
                    buttonSearch: i18n['button.search'],
                    buttonClear: i18n['button.clear']
                };
                if (!this.settings.datepicker) {
                    this.settings.datepicker = {
                        showOn: "button",
                        buttonImage: this.settings.context + "/statics/stylesheets/common/img/icn_calendar_16.png",
                        buttonImageOnly: true,
                        changeMonth: true,
                        changeYear: true,
                        buttonText:  i18n['button.calendar.tooltip'],
                        altFormat: "yy-mm-dd",
                        dateFormat: "yy-mm-dd",
                        onClose: function(dateStr) {
                            $(this).valid();
                        }
                    }
                }
            },
                    
            load: function(id) {
                if (!this.loadedData) {
                    var data = [{
                            i18n: this.settings.i18n
                        }];
                    //the advaced search contain id
                    var advancedSearchCtId = common.advancedSearch.advancedSearchCt + common.advancedSearch.advancedSearchCtId ++;
                    this.advancedSearchContext = '#' + advancedSearchCtId;
                    $('#' + id).append($.tmpl('advancedSearchTmpl', data).attr('id',advancedSearchCtId));
                    this.cacheElements();
                    
                    //remote
                    var url =  this.settings.url;                    
                    var me = this;
                    common.Ajax.get(url, null, function(data){
                        me.filterData = data;
                        me.appendOptions(data);
                        me.initEvent();
                        me.loadedData = true;
                    },'json');
                    /*
                    //local
                    var filterData = [
                        {id: 1, name: 'textType', displayFieldName : 'Last Name', dataType: 'string'},
                        {id: 2, name: 'dateType', displayFieldName : 'DateTxt',dataType: 'date'},
                        {id: 3, name: 'singleType', displayFieldName : 'single Name',dataType: 'single',valueItems:[{text:'text1',value:'value1'},{text:'text2',value:'value2'}]},
                        {id: 4, name: 'multipleType', displayFieldName : 'multiple Name',dataType: 'multiple',valueItems:[{text:'text1',value:'value1'},{text:'text2',value:'value2'}]}];
                    this.filterData = filterData;
                    this.appendOptions(filterData);
                    this.initEvent();
                    this.loadedData = true;
                    */
                }
                $(this.advancedSearchContext).show();
            },
            
            //Cache the elements. We can use them then.  
            //private
            cacheElements: function(){
                this.advanced_search_close = $('[name="advanced_search_close"]', this.advancedSearchContext);//The button of closing the search
                this.advanced_search_rows = $('[name="advanced_search_rows"]', this.advancedSearchContext);//The conditions container
                this.advanced_search_select = $('[name="advanced_search_select"]', this.advancedSearchContext);//Filter Search
                this.currentSearchButton = $('[name="currentSearchButton"]', this.advancedSearchContext);
                this.clearConditionBtn = $('[name="clearConditionBtn"]', this.advancedSearchContext);
            },
                    
            //private        
            appendOptions: function(data, clear) {
                if(!$.isArray(data)){
                    data = [data];
                }
                var select = this.advanced_search_select;
                if(clear === true){
                    select.children('option:gt(0)').remove();
                }
                var me = this;
                var fieldReader = this.settings.fieldReader;
                var options = $(data).map(function(index, element) {
                    var filterIndex = me.settings.filterGen + me.filterIndex ++;
                    me.filterCondition[filterIndex] = data[index];
                    return '<option filterindex="' + filterIndex + '" datatype="' + element[fieldReader.dataType] + '" value="' + element[fieldReader.attributeId] + '">' + element[fieldReader.displayFieldName] + '</option>';
                }).get().join('');
                select.append(options);
            },
            
            // When we change the value of the select, the method will be call.
            addCondition: function(field) {
                var selectedOption = field.options[field.options.selectedIndex];
                var dataType = $(selectedOption).attr('datatype');
                var filterIndex = $(selectedOption).attr('filterindex');
                var options = this.getOptionsByDataType(dataType);
                var submitInputs = this.settings.submitInputs;
                var optionData =  this.filterCondition[filterIndex];
                var fieldReader = this.settings.fieldReader;
                var inputs = [{text : 'filterIndex' ,value : filterIndex}];// the bridge of the option and condition
                for(var key in optionData){
                    if($.inArray(key, submitInputs ) != -1){
                        inputs.push({text : key ,value : optionData[key]});
                    }
                }
                var condition = $.tmpl('conditionTmpl', {
                    options: options, 
                    submitInputs: inputs,
                    optionData : {
                        displayField : optionData[fieldReader.displayFieldName],
                        dataType : optionData[fieldReader.dataType],
                        valueItems :  optionData[fieldReader.valueItems]
                    }
                });
                
                this.advanced_search_rows.append(condition);
                if(dataType === this.settings.dataType.dateTimeField){
                    $('input[name="fieldValue"]',condition ).datepicker(this.settings.datepicker);
                }
                this.addedCondition[filterIndex] = optionData;
                $(selectedOption).remove();
            },
                    
            //private        
            getOptionsByDataType: function(type) {
                var dataType = this.settings.dataType;
                var options = [];
                switch (type) {
                    case dataType.textField:
                        options = [{text: i18n['global.operator.E'], value: 'E'},
                            {text: i18n['global.operator.NE'], value: 'NE'},
                            {text: i18n['global.operator.LIKE'], value: 'LIKE'}
                        ];
                        break;
                    case dataType.dateTimeField:
                        options = [{text: i18n['global.operator.EQTO'], value: 'BETWEEN'},
                            {text: i18n['global.operator.BEFORE'], value: 'LT'},
                            {text: i18n['global.operator.BEFOREOREQ'], value: 'LTE'},
                            {text: i18n['global.operator.AFTER'], value: 'GT'},
                            {text: i18n['global.operator.AFTEROREQ'], value: 'GTE'}
                        ];
                        break;
                    case dataType.multipleSelect:
                        options = [{text: i18n['global.operator.IN'], value: 'IN'},
                            {text: i18n['global.operator.NIN'], value: 'NIN'}
                        ];
                        break;
                    case dataType.singleSelect:
                        options = [{text: i18n['global.operator.IS'], value: 'E'},
                            {text: i18n['global.operator.ISNOT'], value: 'NE'}
                        ];
                        break;
                    default: 
                        options = [{text: i18n['global.operator.E'], value: 'E'},
                            {text: i18n['global.operator.NE'], value: 'NE'},
                            {text: i18n['global.operator.LT'], value: 'LT'},
                            {text: i18n['global.operator.LTE'], value: 'LTE'},
                            {text: i18n['global.operator.GT'], value: 'GT'},
                            {text: i18n['global.operator.GTE'], value: 'GTE'}
                        ];
                }
                return options;
            },
            
            //private
            initEvent : function(){
                var me = this;
                // Filter Search Event
                this.advanced_search_select.change(function() {
                    if (!$(this).val()) {
                        return false;
                    }
                    me.addCondition(this);
                    $(this).val('');
                });
                //delete the condition event
                this.advanced_search_rows.on('click','a.icn_trash_16',function(e){
                    e.preventDefault();
                    var closest = $(this).closest('div.advanced-search-item');
                    var filterIndex = closest.find('input[name="filterIndex"]').val();
                    var optionData = me.addedCondition[filterIndex];
                    me.appendOptions(optionData);
                    delete me.addedCondition[filterIndex];
                    closest.remove();
                });
                
                // search button click event
                this.currentSearchButton.click(function(){
                    if(me.advanced_search_rows.children().length > 0){
                        if($(me.advancedSearchContext).valid()){
                            var search = me.settings.callback.search;
                            if($.isFunction(search)){
                                var conditions = me.getConditions();                             
                                //console.log(conditions);
                                search.call(me.settings.scope || window, conditions);
                            }
                        }
                    }
                });
                
                this.clearConditionBtn.click(function(){
                    me.advanced_search_rows.empty();
                    me.appendOptions(me.filterData, true);
                });
                
                // when the advanced search is closed, the event will be fired.
                this.advanced_search_close.click(function(){
                    $(me.advancedSearchContext).hide();
                    var close = me.settings.callback.close;
                    if ($.isFunction(close)) {
                        close.call(me.settings.scope || window);
                    }
                });
                this.validator = EB_Common.validation.validate(this.advancedSearchContext.substring(1),{});
            },
                 
            /**
             * return advanced search conditions
             * @returns {conditions} Array
             */
            getConditions : function(){
                var conditions = this.advanced_search_rows.find('.advanced-search-item').map(function(index, element){
                    var condition = {};
                    var operator = $(element).find('select[name="operator"]').val(),
                        fieldValue = $(element).find('input[name="fieldValue"],select[name="fieldValue"]').val();
                    $(element).find('input:hidden:not([name="filterIndex"])').each(function(index, element){
                        var name = $(this).attr('name');
                        var val = $(this).val();
                        condition[name] = val;
                    });
                    condition['operator'] = operator;
                    condition['fieldValue'] = fieldValue;
                    return condition;
                }).get();
                
                return conditions;
            }
        }
    });
    common.advancedSearch.initialize = function(config) {
        return new common.advancedSearch(config);
    };
})(EB_Common);
