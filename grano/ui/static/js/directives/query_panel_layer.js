grano.directive('gnQueryPanelLayer', ['metadata', function(metadata) {
  return {
    restrict: 'EA',
    scope: {
      'project': '=',
      'layer': '=',
      'update': '&',
      'remove': '&'
    },
    templateUrl: 'directives/query_panel_layer.html',
    link: function(scope, element, attrs) {
      var schemata = [],
          attributes = [];

      scope.visibleSchemata = [];

      scope.setSchema = function(e) {
        if (scope.layer.obj == 'relation') {
          scope.layer.filters.schema = e.name;  
        } else {
          scope.layer.filters.schemata = e.name;
        }
      };

      scope.getSchemaLabel = function() {
        var label = scope.anyLabel();
        angular.forEach(schemata, function(s) {
          name = scope.layer.filters.schema || scope.layer.filters.schemata;
          if (name == s.name) {
            label = s.meta.plural_upper || s.label;
          }
        });
        return label;
      };

      scope.anyLabel = function() {
        if (scope.layer.obj == 'relation') return 'Any relation type';
        return 'Any entities';
      };

      scope.actionLabel = function() {
        if (scope.layer.root) return 'Find';
        if (scope.layer.obj == 'relation') return 'connected via';
        return 'to';
      };

      scope.availableFields = function () {
        var attrs = [];
        angular.forEach(attributes, function(a) {
          var taken = false;
          angular.forEach(scope.layer.fields.properties, function(v, k) {
            if (k == a.name) taken = true;
          });
          if (!taken) attrs.push(a);
        });
        return attrs;
      };

      scope.availableFilters = function () {
        var attrs = [];
        angular.forEach(attributes, function(a) {
          console.log(a);
          var taken = false;
          angular.forEach(scope.layer.filters.properties, function(p) {
            if (p.name == a.name && p.schema == a.schema.name) taken = true;
          });
          if (!taken) attrs.push(a);
        });
        return attrs;
      };

      scope.addField = function(attr) {
        scope.layer.fields.properties[attr.name] = null;
      };

      scope.addFilter = function(attr) {
        scope.layer.filters.properties[attr.name] = '';
      };

      scope.$watch('layer', function(layer) {
        if (!layer) return;

        metadata.getSchemata().then(function(s) {
          var visible = [{'name': null, 'label': scope.anyLabel()}];
          attributes = [];

          angular.forEach(s, function(sc) {
            if (sc.obj != layer.obj) {
              return;
            }
            
            if (!sc.hidden) visible.push(sc);
            if ((layer.filters && sc.name == layer.filters.schema) || sc.default) {
              angular.forEach(sc.attributes, function(a) {
                var at = angular.copy(a);
                at['schema'] = sc;
                if (!at.hidden) {
                  attributes.push(at);
                }
              });
            }
          });

          schemata = s;
          scope.visibleSchemata = visible;
        });
      });

      scope.$watch('layer', function(o) {
        scope.update();
      }, true);
    }
  };
}]);