(function () {
    define(['jquery',
    './select2'],
    function (jQuery, select2) {
        var _mc3 = {},
            _mc3_host = 'oki-dev.mit.edu',
            _mc3_bank = 'mc3-objectivebank%3A2%40MIT-OEIT';

        function get_active_bank_url () {
            return get_banks_url() + _mc3_bank;
        }

        function get_banks_url () {
            return get_handcar_url() + '/objectivebanks/';
        }

        function get_handcar_url () {
            return get_host_url() + '/handcar/services/learning';
        }

        function get_host_url () {
            return 'https://' + _mc3_host;
        }

        function get_objectives_url () {
            return get_active_bank_url() + '/objectives/';
        }

        function obj_is_outcome (obj) {
            var genus = obj.genusTypeId;
            if (genus === 'mc3-objective%3Amc3.learning.outcome%40MIT-OEIT' ||
                genus === 'mc3-objective%3Amc3.learning.generic.outcome%40MIT-OEIT') {
                return true;
            } else {
                return false;
            }
        }

        _mc3.append_outcomes_selector = function (parent) {
            var sel = jQuery('<input />')
                    .addClass('outcome_selector')
                    .attr('type', 'hidden')
                    .attr('value', ''),
                wrapper = jQuery('<div></div>')
                    .addClass('mc3activity_outcome_link')
                    .append('<span>Link to: </span>');
            wrapper.append(sel);
            parent.append(wrapper);
            return wrapper;
        };

        _mc3.init_outcome_selectors = function () {
            var search_term = '';
            jQuery('.outcome_selector').select2({
                placeholder: 'Link to an MC3 Learning Outcome',
                id: function (obj) {return obj.id;},
                ajax: {
                    url: get_objectives_url(),
                    dataType: 'json',
                    data: function (term, page) {
                        search_term = term.toLowerCase();
                        return {
                            q: term,
                            page: page
                        };
                    },
                    results: function (data) {
                        var counter = data.length;
                        if (counter > 0) {
                            var filtered = [];
                            jQuery.each(data, function (index, obj) {
                                var obj_name = obj.displayName.text;
                                obj_name = obj_name.toLowerCase();
                                if (obj_name.indexOf(search_term) >= 0 &&
                                    obj_is_outcome(obj)) {
                                    filtered.push(obj);
                                }
                            });
                            return {results: filtered};
                        } else {
                            var tmp = [{
                                'displayName': {'text': 'None Found'}
                            }];
                            return {results: tmp};
                        }
                    }
                },
                formatResult: function (obj) {
                    return obj.displayName.text;
                },
                formatSelection: function (obj) {
                    return obj.displayName.text;
                }
            });
        }

        return _mc3;
    });
}).call(this);
