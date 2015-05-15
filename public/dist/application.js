'use strict';

// Init the application configuration module for AngularJS application
var ApplicationConfiguration = (function() {
  // Init module configuration options
  var applicationModuleName = 'press-book';
  var applicationModuleVendorDependencies = ['ngResource', 'ngCookies',  'ngAnimate',  'ngTouch',  'ngSanitize',  'ui.router', 'ui.bootstrap', 'ui.utils', 'angularFileUpload'];

  // Add a new vertical module
  var registerModule = function(moduleName, dependencies) {
    // Create angular module
    angular.module(moduleName, dependencies || []);

    // Add the module to the AngularJS configuration file
    angular.module(applicationModuleName).requires.push(moduleName);
  };

  return {
    applicationModuleName: applicationModuleName,
    applicationModuleVendorDependencies: applicationModuleVendorDependencies,
    registerModule: registerModule
  };
})();

'use strict';

//Start by defining the main module and adding the module dependencies
angular.module(ApplicationConfiguration.applicationModuleName, ApplicationConfiguration.applicationModuleVendorDependencies);

// Setting HTML5 Location Mode
angular.module(ApplicationConfiguration.applicationModuleName).config(['$locationProvider',
  function($locationProvider) {
    $locationProvider.hashPrefix('!');
  }
]);

//Then define the init function for starting up the application
angular.element(document).ready(function() {
  //Fixing facebook bug with redirect
  if (window.location.hash === '#_=_') window.location.hash = '#!';

  //Then init the app
  angular.bootstrap(document, [ApplicationConfiguration.applicationModuleName]);
});
'use strict';

// Use Applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('articles');
'use strict';

// Use Applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('core');
'use strict';

// Use Applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('images');
'use strict';

// Use Applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('pins');
'use strict';

// Use Applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('pressbooks');
'use strict';

// Use Applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('users');
'use strict';

// Configuring the Articles module
angular.module('articles').run(['Menus',
  function(Menus) {
    // Set top bar menu items
    Menus.addMenuItem('topbar', 'Articles', 'articles', 'dropdown', '/articles(/create)?');
    Menus.addSubMenuItem('topbar', 'articles', 'List Articles', 'articles');
    Menus.addSubMenuItem('topbar', 'articles', 'New Article', 'articles/create');
  }
]);
'use strict';

// Setting up route
angular.module('articles').config(['$stateProvider',
  function($stateProvider) {
    // Articles state routing
    $stateProvider.
    state('listArticles', {
      url: '/articles',
      templateUrl: 'modules/articles/views/list-articles.client.view.html'
    }).
    state('createArticle', {
      url: '/articles/create',
      templateUrl: 'modules/articles/views/create-article.client.view.html'
    }).
    state('viewArticle', {
      url: '/articles/:articleId',
      templateUrl: 'modules/articles/views/view-article.client.view.html'
    }).
    state('editArticle', {
      url: '/articles/:articleId/edit',
      templateUrl: 'modules/articles/views/edit-article.client.view.html'
    });
  }
]);
'use strict';

angular.module('articles').controller('ArticlesController', ['$scope', '$stateParams', '$location', 'Authentication', 'Articles',
  function($scope, $stateParams, $location, Authentication, Articles) {
    $scope.authentication = Authentication;

    $scope.create = function() {
      var article = new Articles({
        title: this.title,
        content: this.content
      });
      article.$save(function(response) {
        $location.path('articles/' + response._id);

        $scope.title = '';
        $scope.content = '';
      }, function(errorResponse) {
        $scope.error = errorResponse.data.message;
      });
    };

    $scope.remove = function(article) {
      if (article) {
        article.$remove();

        for (var i in $scope.articles) {
          if ($scope.articles[i] === article) {
            $scope.articles.splice(i, 1);
          }
        }
      } else {
        $scope.article.$remove(function() {
          $location.path('articles');
        });
      }
    };

    $scope.update = function() {
      var article = $scope.article;

      article.$update(function() {
        $location.path('articles/' + article._id);
      }, function(errorResponse) {
        $scope.error = errorResponse.data.message;
      });
    };

    $scope.find = function() {
      $scope.articles = Articles.query();
    };

    $scope.findOne = function() {
      $scope.article = Articles.get({
        articleId: $stateParams.articleId
      });
    };
  }
]);

'use strict';

//Articles service used for communicating with the articles REST endpoints
angular.module('articles').factory('Articles', ['$resource',
  function($resource) {
    return $resource('articles/:articleId', {
      articleId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });
  }
]);
'use strict';

// Setting up route
angular.module('core').config(['$stateProvider', '$urlRouterProvider',
  function($stateProvider, $urlRouterProvider) {
    // Redirect to home view when route not found
    $urlRouterProvider.otherwise('/');

    // Home state routing
    $stateProvider.
    state('home', {
      url: '/',
      templateUrl: 'modules/core/views/home.client.view.html'
    });
  }
]);
'use strict';

angular.module('core').controller('HeaderController', ['$scope', 'Authentication', 'Menus',
  function($scope, Authentication, Menus) {
    $scope.authentication = Authentication;
    $scope.isCollapsed = false;
    $scope.menu = Menus.getMenu('topbar');

    $scope.toggleCollapsibleMenu = function() {
      $scope.isCollapsed = !$scope.isCollapsed;
    };

    // Collapsing the menu after navigation
    $scope.$on('$stateChangeSuccess', function() {
      $scope.isCollapsed = false;
    });
  }
]);

'use strict';


angular.module('core').controller('HomeController', ['$scope', 'Authentication',
  function($scope, Authentication) {
    // This provides Authentication context.
    $scope.authentication = Authentication;
  }
]);

'use strict';

//Menu service used for managing  menus
angular.module('core').service('Menus', [

  function() {
    // Define a set of default roles
    this.defaultRoles = ['*'];

    // Define the menus object
    this.menus = {};

    // A private function for rendering decision 
    var shouldRender = function(user) {
      if (user) {
        if (!!~this.roles.indexOf('*')) {
          return true;
        } else {
          for (var userRoleIndex in user.roles) {
            for (var roleIndex in this.roles) {
              if (this.roles[roleIndex] === user.roles[userRoleIndex]) {
                return true;
              }
            }
          }
        }
      } else {
        return this.isPublic;
      }

      return false;
    };

    // Validate menu existance
    this.validateMenuExistance = function(menuId) {
      if (menuId && menuId.length) {
        if (this.menus[menuId]) {
          return true;
        } else {
          throw new Error('Menu does not exists');
        }
      } else {
        throw new Error('MenuId was not provided');
      }

      return false;
    };

    // Get the menu object by menu id
    this.getMenu = function(menuId) {
      // Validate that the menu exists
      this.validateMenuExistance(menuId);

      // Return the menu object
      return this.menus[menuId];
    };

    // Add new menu object by menu id
    this.addMenu = function(menuId, isPublic, roles) {
      // Create the new menu
      this.menus[menuId] = {
        isPublic: isPublic || false,
        roles: roles || this.defaultRoles,
        items: [],
        shouldRender: shouldRender
      };

      // Return the menu object
      return this.menus[menuId];
    };

    // Remove existing menu object by menu id
    this.removeMenu = function(menuId) {
      // Validate that the menu exists
      this.validateMenuExistance(menuId);

      // Return the menu object
      delete this.menus[menuId];
    };

    // Add menu item object
    this.addMenuItem = function(menuId, menuItemTitle, menuItemURL, menuItemType, menuItemUIRoute, isPublic, roles, position) {
      // Validate that the menu exists
      this.validateMenuExistance(menuId);

      // Push new menu item
      this.menus[menuId].items.push({
        title: menuItemTitle,
        link: menuItemURL,
        menuItemType: menuItemType || 'item',
        menuItemClass: menuItemType,
        uiRoute: menuItemUIRoute || ('/' + menuItemURL),
        isPublic: ((isPublic === null || typeof isPublic === 'undefined') ? this.menus[menuId].isPublic : isPublic),
        roles: ((roles === null || typeof roles === 'undefined') ? this.menus[menuId].roles : roles),
        position: position || 0,
        items: [],
        shouldRender: shouldRender
      });

      // Return the menu object
      return this.menus[menuId];
    };

    // Add submenu item object
    this.addSubMenuItem = function(menuId, rootMenuItemURL, menuItemTitle, menuItemURL, menuItemUIRoute, isPublic, roles, position) {
      // Validate that the menu exists
      this.validateMenuExistance(menuId);

      // Search for menu item
      for (var itemIndex in this.menus[menuId].items) {
        if (this.menus[menuId].items[itemIndex].link === rootMenuItemURL) {
          // Push new submenu item
          this.menus[menuId].items[itemIndex].items.push({
            title: menuItemTitle,
            link: menuItemURL,
            uiRoute: menuItemUIRoute || ('/' + menuItemURL),
            isPublic: ((isPublic === null || typeof isPublic === 'undefined') ? this.menus[menuId].items[itemIndex].isPublic : isPublic),
            roles: ((roles === null || typeof roles === 'undefined') ? this.menus[menuId].items[itemIndex].roles : roles),
            position: position || 0,
            shouldRender: shouldRender
          });
        }
      }

      // Return the menu object
      return this.menus[menuId];
    };

    // Remove existing menu object by menu id
    this.removeMenuItem = function(menuId, menuItemURL) {
      // Validate that the menu exists
      this.validateMenuExistance(menuId);

      // Search for menu item to remove
      for (var itemIndex in this.menus[menuId].items) {
        if (this.menus[menuId].items[itemIndex].link === menuItemURL) {
          this.menus[menuId].items.splice(itemIndex, 1);
        }
      }

      // Return the menu object
      return this.menus[menuId];
    };

    // Remove existing menu object by menu id
    this.removeSubMenuItem = function(menuId, submenuItemURL) {
      // Validate that the menu exists
      this.validateMenuExistance(menuId);

      // Search for menu item to remove
      for (var itemIndex in this.menus[menuId].items) {
        for (var subitemIndex in this.menus[menuId].items[itemIndex].items) {
          if (this.menus[menuId].items[itemIndex].items[subitemIndex].link === submenuItemURL) {
            this.menus[menuId].items[itemIndex].items.splice(subitemIndex, 1);
          }
        }
      }

      // Return the menu object
      return this.menus[menuId];
    };

    //Adding the topbar menu
    this.addMenu('topbar');
  }
]);
'use strict';

// Configuring the Images module
angular.module('images').run(['Menus',
  function(Menus) {
    // Set top bar menu items
    Menus.addMenuItem('topbar', 'Images', 'images', 'dropdown', '/images(/create)?');
    Menus.addSubMenuItem('topbar', 'images', 'List Images', 'images');
    Menus.addSubMenuItem('topbar', 'images', 'Upload Images', 'images/create');
  }
]);

'use strict';

// Setting up route
angular.module('images').config(['$stateProvider',
  function($stateProvider) {
    // Images state routing
    $stateProvider.
    state('listImages', {
      url: '/images',
      templateUrl: 'modules/images/views/list-images.client.view.html'
    }).
    state('createImage', {
      url: '/images/create',
      templateUrl: 'modules/images/views/create-image.client.view.html'
    }).
    state('viewImage', {
      url: '/images/:imageId',
      templateUrl: 'modules/images/views/view-image.client.view.html'
    });
  }
]);

'use strict';

angular.module('images').controller('ImagesController', ['$scope', '$stateParams', '$location', 'Images', '$http', 'FileUploader', 'Authentication',
  function($scope, $stateParams, $location, Images, $http, FileUploader, Authentication) {
    $scope.authentication = Authentication;

    var uploader = $scope.uploader = new FileUploader({
        url: '/images'
    });

    uploader.filters.push({
        name: 'imageFilter',
        fn: function(item /*{File|FileLikeObject}*/, options) {
            var type = '|' + item.type.slice(item.type.lastIndexOf('/') + 1) + '|';
            return '|jpg|png|jpeg|bmp|gif|'.indexOf(type) !== -1;
        }
    });

    uploader.onWhenAddingFileFailed = function(item /*{File|FileLikeObject}*/, filter, options) {
      // console.info('onWhenAddingFileFailed', item, filter, options);
    };
    uploader.onAfterAddingFile = function(fileItem) {
      // console.info('onAfterAddingFile', fileItem);
    };
    uploader.onAfterAddingAll = function(addedFileItems) {
      // console.info('onAfterAddingAll', addedFileItems);
    };
    uploader.onBeforeUploadItem = function(item) {
      // console.info('onBeforeUploadItem', item);
    };
    uploader.onProgressItem = function(fileItem, progress) {
      // console.info('onProgressItem', fileItem, progress);
    };
    uploader.onProgressAll = function(progress) {
      // console.info('onProgressAll', progress);
    };
    uploader.onSuccessItem = function(fileItem, response, status, headers) {
      // console.info('onSuccessItem', fileItem, response, status, headers);
    };
    uploader.onErrorItem = function(fileItem, response, status, headers) {
      console.info('onErrorItem', fileItem, response, status, headers);
    };
    uploader.onCancelItem = function(fileItem, response, status, headers) {
      // console.info('onCancelItem', fileItem, response, status, headers);
    };
    uploader.onCompleteItem = function(fileItem, response, status, headers) {
      // console.info('onCompleteItem', fileItem, response, status, headers);
    };
    uploader.onCompleteAll = function() {
      // console.info('onCompleteAll');
      $location.path('images');
    };

    $scope.remove = function(image) {
      if (image) {
        image.$remove();

        for (var i in $scope.images) {
          if ($scope.images[i] === image) {
            $scope.images.splice(i, 1);
          }
        }
      } else {
        $scope.image.$remove(function() {
          $location.path('images');
        });
      }
    };

    $scope.find = function() {
      $scope.images = Images.query();
    };

    $scope.findOne = function() {
      $scope.image = Images.get({
        imageId: $stateParams.imageId
      });
    };

    $scope.addToPressbook = function(image) {
      image.isInPressbook = !image.isInPressbook;

      image.$update(function() {
      }, function(errorResponse) {
        $scope.error = errorResponse.data.message;
      });
    };

    $scope.convertSize = function(image) {
      return Math.round(image.size / 1024 / 1024 * 100) / 100 + 'Mb';
    };
  }
]);

'use strict';

/**
* The ng-thumb directive
* @author: nerv
* @version: 0.1.2, 2014-01-09
*/
angular.module('images').directive('ngThumb', ['$window',
  function($window) {
    var helper = {
      support: !!($window.FileReader && $window.CanvasRenderingContext2D),
      isFile: function(item) {
        return angular.isObject(item) && item instanceof $window.File;
      },
      isImage: function(file) {
        var type =  '|' + file.type.slice(file.type.lastIndexOf('/') + 1) + '|';
        return '|jpg|png|jpeg|bmp|gif|'.indexOf(type) !== -1;
      }
    };

    return {
      restrict: 'A',
      template: '<canvas/>',
      link: function(scope, element, attributes) {
        if (!helper.support) return;

        var params = scope.$eval(attributes.ngThumb);

        if (!helper.isFile(params.file)) return;
        if (!helper.isImage(params.file)) return;

        var canvas = element.find('canvas');
        var reader = new FileReader();

        function onLoadFile(event) {
          var img = new Image();
          function onLoadImage() {
            var width = params.width || img.width / img.height * params.height;
            var height = params.height || img.height / img.width * params.width;
            canvas.attr({ width: width, height: height });
            canvas[0].getContext('2d').drawImage(img, 0, 0, width, height);
          }

          img.onload = onLoadImage;
          img.src = event.target.result;
        }

        reader.onload = onLoadFile;
        reader.readAsDataURL(params.file);
      }
    };
  }
]);

'use strict';

//Images service used for communicating with the images REST endpoints
angular.module('images').factory('Images', ['$resource',
  function($resource) {
    return $resource('images/:imageId', {
      imageId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });
  }
]);

'use strict';

// Configuring the Pins module
angular.module('pins').run(['Menus',
  function(Menus) {
    // Set top bar menu items
    Menus.addMenuItem('topbar', 'Pins', 'pins', 'dropdown', '/pins(/create)?');
    Menus.addSubMenuItem('topbar', 'pins', 'List Pins', 'pins');
    Menus.addSubMenuItem('topbar', 'pins', 'Extract Pins', 'pins/create');
  }
]);

'use strict';

// Setting up route
angular.module('pins').config(['$stateProvider',
  function($stateProvider) {
    // Pins state routing
    $stateProvider.
    state('listPins', {
      url: '/pins',
      templateUrl: 'modules/pins/views/list-pins.client.view.html'
    }).
    state('createPin', {
      url: '/pins/create',
      templateUrl: 'modules/pins/views/create-pin.client.view.html'
    }).
    state('viewPin', {
      url: '/pins/:pinId',
      templateUrl: 'modules/pins/views/view-pin.client.view.html'
    });
  }
]);

'use strict';

angular.module('pins').controller('PinsController', ['$scope', '$stateParams', '$location', 'Pins', 'Authentication',
  function($scope, $stateParams, $location, Pins, Authentication) {

    $scope.create = function() {
      var pin = new Pins({
        accountName: this.accountName,
        boardName: this.boardName
      });

      pin.$save(function(response) {
        $location.path('pins');

        $scope.accountName = '';
        $scope.boardName = '';
      }, function(errorResponse) {
        $scope.error = errorResponse.data.message;
      });
    };

    $scope.remove = function(pin) {
      if (pin) {
        pin.$remove();

        for (var i in $scope.pins) {
          if ($scope.pins[i] === pin) {
            $scope.pins.splice(i, 1);
          }
        }
      } else {
        $scope.pin.$remove(function() {
          $location.path('pins');
        });
      }
    };

    $scope.update = function() {
      var pin = $scope.pin;

      pin.$update(function() {
        $location.path('pins/' + pin._id);
      }, function(errorResponse) {
        $scope.error = errorResponse.data.message;
      });
    };

    $scope.find = function() {
      $scope.pins = Pins.query();
    };

    $scope.findOne = function() {
      $scope.pin = Pins.get({
        pinId: $stateParams.pinId
      });
    };

    $scope.getBigImageLink = function (pin) {
      if(pin.imageLink) {
        return pin.imageLink.replace('237x', '736x');
      }
    };

    $scope.addToPressbook = function(pin) {
      pin.isInPressbook = !pin.isInPressbook;

      pin.$update(function() {
      }, function(errorResponse) {
        $scope.error = errorResponse.data.message;
      });
    };
  }
]);

'use strict';

//Pins service used for communicating with the pins REST endpoints
angular.module('pins').factory('Pins', ['$resource',
  function($resource) {
    return $resource('pins/:pinId', {
      pinId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });
  }
]);
'use strict';

// Configuring the Pressbooks module
angular.module('pressbooks').run(['Menus',
  function(Menus) {
    // Set top bar menu items
    Menus.addMenuItem('topbar', 'Pressbooks', 'pressbooks', 'dropdown', '/pressbooks(/create)?');
    Menus.addSubMenuItem('topbar', 'pressbooks', 'List Pressbooks', 'pressbooks');
    Menus.addSubMenuItem('topbar', 'pressbooks', 'Generate Pressbooks', 'pressbooks/generate');
  }
]);

'use strict';

// Setting up route
angular.module('pressbooks').config(['$stateProvider',
  function($stateProvider) {
    // Pressbooks state routing
    $stateProvider.
    state('listPressbooks', {
      url: '/pressbooks',
      templateUrl: 'modules/pressbooks/views/list-pressbooks.client.view.html'
    }).
    state('generatePressbook', {
      url: '/pressbooks/generate',
      templateUrl: 'modules/pressbooks/views/generate-pressbook.client.view.html'
    }).
    state('viewPressbook', {
      url: '/pressbooks/:pressbookId',
      templateUrl: 'modules/pressbooks/views/view-pressbook.client.view.html'
    });
  }
]);

'use strict';

angular.module('pressbooks').controller('PressbooksController', ['$scope', '$stateParams', '$location', 'Pressbooks', '$http', 'Authentication',
  function($scope, $stateParams, $location, Pressbooks, $http, Authentication) {
    $scope.authentication = Authentication;

    $scope.pressbookTempo = {};

    $scope.placeholder1 = {};
    $scope.placeholder2 = {};
    $scope.placeholder3 = {};
    $scope.placeholder4 = {};

    $scope.remove = function(pressbook) {
      if (pressbook) {
        pressbook.$remove();

        for (var i in $scope.pressbooks) {
          if ($scope.pressbooks[i] === pressbook) {
            $scope.pressbooks.splice(i, 1);
          }
        }
      } else {
        $scope.pressbook.$remove(function() {
          $location.path('pressbooks');
        });
      }
    };

    $scope.update = function(pressbook) {
      if($scope.placeholder1.value) {
        pressbook.placeholder1 = $scope.placeholder1.value;
        $scope.placeholder1.value = '';
      }
      if($scope.placeholder2.value) {
        pressbook.placeholder2 = $scope.placeholder2.value;
        $scope.placeholder2.value = '';
      }
      if($scope.placeholder3.value) {
        pressbook.placeholder3 = $scope.placeholder3.value;
        $scope.placeholder3.value = '';
      }
      if($scope.placeholder4.value) {
        pressbook.placeholder4 = $scope.placeholder4.value;
        $scope.placeholder4.value = '';
      }
      updateAcPlaceholderValues(pressbook);

      pressbook.$update(function(err) {
        pressbook.edit = false;
      }, function(errorResponse) {
        $scope.error = errorResponse.data.message;
      });
    };

    $scope.find = function() {
      $scope.pressbooks = Pressbooks.query(function(data) {
        $scope.pressbooks.forEach(function(pressbook) {
          updateAcPlaceholderValues(pressbook);
        });
      });
    };

    var updateAcPlaceholderValues = function(pressbook) {
      if(pressbook.placeholder1 &&
          !~$scope.acPlaceholder1Values.indexOf(pressbook.placeholder1)) {
        $scope.acPlaceholder1Values.push(pressbook.placeholder1);
      }
      if(pressbook.placeholder2 &&
          !~$scope.acPlaceholder2Values.indexOf(pressbook.placeholder2)) {
        $scope.acPlaceholder2Values.push(pressbook.placeholder2);
      }
      if(pressbook.placeholder3 &&
          !~$scope.acPlaceholder3Values.indexOf(pressbook.placeholder3)) {
        $scope.acPlaceholder3Values.push(pressbook.placeholder3);
      }
    };

    $scope.findOne = function() {
      $scope.pressbook = Pressbooks.get({
        pressbookId: $stateParams.pressbookId
      });
    };

    $scope.getImageLink = function (pressbook) {
      if(pressbook && pressbook.image) {
        return '/uploads/' + pressbook.image.filename;
      } else if(pressbook && pressbook.pin) {
        return pressbook.pin.imageLink.replace('237x', '736x');
      }
    };

    $scope.getType = function (pressbook) {
      if(pressbook.image) {
        return 'Image';
      } else if(pressbook.pin) {
        return 'Pin';
      }
    };

    $scope.edit = function(pressbook) {
      pressbook.edit = !pressbook.edit;

      if(pressbook.edit) {
        $scope.placeholder1.value = pressbook.placeholder1;
        $scope.placeholder2.value = pressbook.placeholder2;
        $scope.placeholder3.value = pressbook.placeholder3;
        $scope.placeholder4.value = pressbook.placeholder4;
      } else {
        $scope.placeholder1.value = '';
        $scope.placeholder2.value = '';
        $scope.placeholder3.value = '';
        $scope.placeholder4.value = '';
      }
    };

    $scope.updateText = function() {
      $scope.textTemplateEncoded = encodeURIComponent($scope.textTemplate);
    };

    $scope.acPlaceholder1Values = [];
    $scope.acPlaceholder2Values = [];
    $scope.acPlaceholder3Values = [];

    function suggestPlaceholder1(term) {
      var q = term.toLowerCase().trim();
      var results = [];
      // Find first 10 acPlaceholder1 that start with `term`.
      for (var i = 0; i < $scope.acPlaceholder1Values.length && results.length < 10; i++) {
        var state = $scope.acPlaceholder1Values[i];
        if (state.toLowerCase().indexOf(q) === 0)
          results.push({ label: state, value: state });
      }
      return results;
    }

    $scope.acPlaceholder1 = {
      suggest: suggestPlaceholder1
    };

    function suggestPlaceholder2(term) {
      var q = term.toLowerCase().trim();
      var results = [];
      // Find first 10 acPlaceholder2 that start with `term`.
      for (var i = 0; i < $scope.acPlaceholder2Values.length && results.length < 10; i++) {
        var state = $scope.acPlaceholder2Values[i];
        if (state.toLowerCase().indexOf(q) === 0)
          results.push({ label: state, value: state });
      }
      return results;
    }

    $scope.acPlaceholder2 = {
      suggest: suggestPlaceholder2
    };

    function suggestPlaceholder3(term) {
      var q = term.toLowerCase().trim();
      var results = [];
      // Find first 10 acPlaceholder3 that start with `term`.
      for (var i = 0; i < $scope.acPlaceholder3Values.length && results.length < 10; i++) {
        var state = $scope.acPlaceholder3Values[i];
        if (state.toLowerCase().indexOf(q) === 0)
          results.push({ label: state, value: state });
      }
      return results;
    }

    $scope.acPlaceholder3 = {
      suggest: suggestPlaceholder3
    };
  }
]);

'use strict';

angular.module('pressbooks').directive('massAutocomplete', ['$timeout', '$window', '$document', '$q', function ($timeout, $window, $document, $q) {

  return {
    restrict: 'A',
    scope: { options: '&massAutocomplete' },
    transclude: true,
    template:
      '<span ng-transclude></span>' +
      '<div class="ac-container" ng-show="show_autocomplete && results.length > 0">' +
        '<ul class="ac-menu">' +
          '<li ng-repeat="result in results" ng-if="$index > 0" ' +
            'class="ac-menu-item" ng-class="$index == selected_index ? \'ac-state-focus\': \'\'">' +
            '<span href ng-click="apply_selection($index)" ng-bind-html="result.label"></span>' +
          '</li>' +
        '</ul>' +
      '</div>',
    link: function (scope, element) {
      scope.container = angular.element(element[0].getElementsByClassName('ac-container')[0]);
    },
    controller: ['$scope', function ($scope) {
      var that = this;

      var KEYS = {
        TAB: 9,
        ESC: 27,
        ENTER: 13,
        UP: 38,
        DOWN: 40
      };

      var EVENTS = {
        KEYDOWN: 'keydown',
        RESIZE: 'resize',
        BLUR: 'blur'
      };

      var _user_options = $scope.options() || {};
      var user_options = {
        debounce_position: _user_options.debounce_position || 150,
        debounce_attach: _user_options.debounce_attach || 300,
        debounce_suggest: _user_options.debounce_suggest || 200,
        debounce_blur: _user_options.debounce_blur || 150
      };

      var current_element,
          current_model,
          current_options,
          previous_value,
          value_watch,
          last_selected_value;

      $scope.show_autocomplete = false;

      // Debounce - taken from underscore
      function debounce(func, wait, immediate) {
          var timeout;
          return function() {
              var context = this, args = arguments;
              var later = function() {
                  timeout = null;
                  if (!immediate) func.apply(context, args);
              };
              var callNow = immediate && !timeout;
              clearTimeout(timeout);
              timeout = setTimeout(later, wait);
              if (callNow) func.apply(context, args);
          };
      }

      function _position_autocomplete() {
        var rect = current_element[0].getBoundingClientRect(),
            scrollTop = $document[0].body.scrollTop || $document[0].documentElement.scrollTop || $window.pageYOffset,
            scrollLeft = $document[0].body.scrollLeft || $document[0].documentElement.scrollLeft || $window.pageXOffset,
            container = $scope.container[0];

        container.style.top = rect.top + rect.height + scrollTop + 'px';
        container.style.left = rect.left + scrollLeft + 'px';
        container.style.width = rect.width + 'px';
      }
      var position_autocomplete = debounce(_position_autocomplete, user_options.debounce_position);

      // Attach autocomplete behaviour to an input element.
      function _attach(ngmodel, target_element, options) {
        // Element is already attached.
        if (current_element === target_element) return;
        // Safe: clear previously attached elements.
        if (current_element) that.detach();
        // The element is still the active element.
        if (target_element[0] !== $document[0].activeElement) return;

        options.on_attach && options.on_attach();

        current_element = target_element;
        current_model = ngmodel;
        current_options = options;
        previous_value = ngmodel.$viewValue;

        $scope.results = [];
        $scope.selected_index = -1;
        bind_element();

        value_watch = $scope.$watch(
          function () {
            return ngmodel.$modelValue;
          },
          function (nv, ov) {
            // Prevent suggestion cycle when the value is the last value selected.
            // When selecting from the menu the ng-model is updated and this watch
            // is triggered. This causes another suggestion cycle that will provide as
            // suggestion the value that is currently selected - this is unnecessary.
            if (nv === last_selected_value)
              return;

            _position_autocomplete();
            suggest(nv, current_element);
          }
        );
      }
      that.attach = debounce(_attach, user_options.debounce_attach);

      function _suggest(term, target_element) {
        $scope.selected_index = 0;
        $scope.waiting_for_suggestion = true;

        if (typeof(term) === 'string' && term.length > 0) {
          $q.when(current_options.suggest(term),
            function suggest_succeeded(suggestions) {
              // Make sure the suggestion we are processing is of the current element.
              // When using remote sources for example, a suggestion cycnle might be
              // triggered at a later time (When a different field is in focus).
              if (!current_element || current_element !== target_element)
                return;

              if (suggestions && suggestions.length > 0) {
              // Add the original term as the first value to enable the user
              // to return to his original expression after suggestions were made.
                $scope.results = [{ value: term, label: ''}].concat(suggestions);
                $scope.show_autocomplete = true;
                if (current_options.auto_select_first)
                    set_selection(1);
              } else {
                $scope.results = [];
              }
            },
            function suggest_failed(error) {
              $scope.show_autocomplete = false;
              current_options.on_error && current_options.on_error(error);
            }
          ).finally(function suggest_finally() {
            $scope.waiting_for_suggestion = false;
          });
        } else {
          $scope.waiting_for_suggestion = false;
          $scope.show_autocomplete = false;
          $scope.$apply();
        }
      }
      var suggest = debounce(_suggest, user_options.debounce_suggest);

      // Trigger end of editing and remove all attachments made by
      // this directive to the input element.
      that.detach = function () {
        if (current_element) {
          var value = current_element.val();
          update_model_value(value);
          current_options.on_detach && current_options.on_detach(value);
          current_element.unbind(EVENTS.KEYDOWN);
          current_element.unbind(EVENTS.BLUR);
        }

        // Clear references and events.
        $scope.show_autocomplete = false;
        angular.element($window).unbind(EVENTS.RESIZE);
        value_watch && value_watch();
        $scope.selected_index = $scope.results = undefined;
        current_model = current_element = previous_value = undefined;
      };

      // Update angular's model view value.
      // It is important that before triggering hooks the model's view
      // value will be synced with the visible value to the user. This will
      // allow the consumer controller to rely on its local ng-model.
      function update_model_value(value) {
        if (current_model.$modelValue !== value) {
          current_model.$setViewValue(value);
          current_model.$render();
        }
      }

      // Set the current selection while navigating through the menu.
      function set_selection(i) {
        // We use value instead of setting the model's view value
        // because we watch the model value and setting it will trigger
        // a new suggestion cycle.
        var selected = $scope.results[i];
        current_element.val(selected.value);
        $scope.selected_index = i;
        return selected;
      }

      // Apply and accept the current selection made from the menu.
      // When selecting from the menu directly (using click or touch) the
      // selection is directly applied.
      $scope.apply_selection = function (i) {
        current_element[0].focus();
        if (!$scope.show_autocomplete || i > $scope.results.length || i < 0)
          return;

        var selected = set_selection(i);
        last_selected_value = selected.value;
        update_model_value(selected.value);
        $scope.show_autocomplete = false;

        current_options.on_select && current_options.on_select(selected);
      };

      function bind_element() {
        angular.element($window).bind(EVENTS.RESIZE, position_autocomplete);

        current_element.bind(EVENTS.BLUR, function () {
          // Detach the element from the auto complete when input loses focus.
          // Focus is lost when a selection is made from the auto complete menu
          // using the mouse (or touch). In that case we don't want to detach so
          // we wait several ms for the input to regain focus.
          $timeout(function() {
            if (!current_element || current_element[0] !== $document[0].activeElement)
              that.detach();
          }, user_options.debounce_blur);
        });

        current_element.bind(EVENTS.KEYDOWN, function (e) {
          // Reserve key combinations with shift for different purposes.
          if (e.shiftKey) return;

          switch (e.keyCode) {
            // Close the menu if it's open. Or, undo changes made to the value
            // if the menu is closed.
            case KEYS.ESC:
              if ($scope.show_autocomplete) {
                $scope.show_autocomplete = false;
                $scope.$apply();
              } else {
                current_element.val(previous_value);
              }
              break;

            // Select an element and close the menu. Or, if a selection is
            // unavailable let the event propagate.
            case KEYS.ENTER:
              // Accept a selection only if results exist, the menu is
              // displayed and the results are valid (no current request
              // for new suggestions is active).
              if ($scope.show_autocomplete &&
                  $scope.selected_index > 0 &&
                  !$scope.waiting_for_suggestion) {
                $scope.apply_selection($scope.selected_index);
                // When selecting an item from the AC list the focus is set on
                // the input element. So the enter will cause a keypress event
                // on the input itself. Since this enter is not intended for the
                // input but for the AC result we prevent propagation to parent
                // elements because this event is not of their concern. We cannot
                // prevent events from firing when the event was registered on
                // the input itself.
                e.stopPropagation();
                e.preventDefault();
              }

              $scope.show_autocomplete = false;
              $scope.$apply();
              break;

            // Navigate the menu when it's open. When it's not open fall back
            // to default behavior.
            case KEYS.TAB:
              if (!$scope.show_autocomplete)
                break;

              e.preventDefault();
              /* falls through */

            // Open the menu when results exists but are not displayed. Or,
            // select the next element when the menu is open. When reaching
            // bottom wrap to top.
            case KEYS.DOWN:
              if ($scope.results.length > 0) {
                if ($scope.show_autocomplete) {
                  set_selection($scope.selected_index + 1 > $scope.results.length - 1 ? 0 : $scope.selected_index + 1);
                } else {
                  $scope.show_autocomplete = true;
                  $scope.selected_index = 0;
                }
                $scope.$apply();
              }
              break;

            // Navigate up in the menu. When reaching the top wrap to bottom.
            case KEYS.UP:
              if ($scope.show_autocomplete) {
                e.preventDefault();
                set_selection($scope.selected_index - 1 >= 0 ? $scope.selected_index - 1 : $scope.results.length - 1);
                $scope.$apply();
              }
              break;
          }
        });
      }

      $scope.$on('$destroy', function () {
        that.detach();
        $scope.container.remove();
      });
    }]
  };
}])

.directive('massAutocompleteItem', function () {

  return {
    restrict: 'A',
    require: ['^massAutocomplete', 'ngModel'],
    scope: {'massAutocompleteItem' : '&'},
    link: function (scope, element, attrs, required) {
      // Prevent html5/browser auto completion.
      attrs.$set('autocomplete', 'off');

      element.bind('focus', function () {
        var options = scope.massAutocompleteItem();
        if (!options)
          throw 'Invalid options';
        required[0].attach(required[1], element, options);
      });
    }
  };
});

'use strict';

//Pressbooks service used for communicating with the pressbooks REST endpoints
angular.module('pressbooks').factory('Pressbooks', ['$resource',
  function($resource) {
    return $resource('pressbooks/:pressbookId', {
      pressbookId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });
  }
]);
'use strict';

// Config HTTP Error Handling
angular.module('users').config(['$httpProvider',
	function($httpProvider) {
		// Set the httpProvider "not authorized" interceptor
		$httpProvider.interceptors.push(['$q', '$location', 'Authentication',
			function($q, $location, Authentication) {
				return {
					responseError: function(rejection) {
						switch (rejection.status) {
							case 401:
								// Deauthenticate the global user
								Authentication.user = null;

								// Redirect to signin page
								$location.path('signin');
								break;
							case 403:
								// Add unauthorized behaviour 
								break;
						}

						return $q.reject(rejection);
					}
				};
			}
		]);
	}
]);
'use strict';

// Setting up route
angular.module('users').config(['$stateProvider',
	function($stateProvider) {
		// Users state routing
		$stateProvider.
		state('profile', {
			url: '/settings/profile',
			templateUrl: 'modules/users/views/settings/edit-profile.client.view.html'
		}).
		state('password', {
			url: '/settings/password',
			templateUrl: 'modules/users/views/settings/change-password.client.view.html'
		}).
		state('accounts', {
			url: '/settings/accounts',
			templateUrl: 'modules/users/views/settings/social-accounts.client.view.html'
		}).
		state('signup', {
			url: '/signup',
			templateUrl: 'modules/users/views/authentication/signup.client.view.html'
		}).
		state('signin', {
			url: '/signin',
			templateUrl: 'modules/users/views/authentication/signin.client.view.html'
		}).
		state('forgot', {
			url: '/password/forgot',
			templateUrl: 'modules/users/views/password/forgot-password.client.view.html'
		}).
		state('reset-invalid', {
			url: '/password/reset/invalid',
			templateUrl: 'modules/users/views/password/reset-password-invalid.client.view.html'
		}).
		state('reset-success', {
			url: '/password/reset/success',
			templateUrl: 'modules/users/views/password/reset-password-success.client.view.html'
		}).
		state('reset', {
			url: '/password/reset/:token',
			templateUrl: 'modules/users/views/password/reset-password.client.view.html'
		});
	}
]);
'use strict';

angular.module('users').controller('AuthenticationController', ['$scope', '$http', '$location', 'Authentication',
	function($scope, $http, $location, Authentication) {
		$scope.authentication = Authentication;

		// If user is signed in then redirect back home
		if ($scope.authentication.user) $location.path('/');

		$scope.signup = function() {
			$http.post('/auth/signup', $scope.credentials).success(function(response) {
				// If successful we assign the response to the global user model
				$scope.authentication.user = response;

				// And redirect to the index page
				$location.path('/');
			}).error(function(response) {
				$scope.error = response.message;
			});
		};

		$scope.signin = function() {
			$http.post('/auth/signin', $scope.credentials).success(function(response) {
				// If successful we assign the response to the global user model
				$scope.authentication.user = response;

				// And redirect to the index page
				$location.path('/');
			}).error(function(response) {
				$scope.error = response.message;
			});
		};
	}
]);
'use strict';

angular.module('users').controller('PasswordController', ['$scope', '$stateParams', '$http', '$location', 'Authentication',
	function($scope, $stateParams, $http, $location, Authentication) {
		$scope.authentication = Authentication;

		//If user is signed in then redirect back home
		if ($scope.authentication.user) $location.path('/');

		// Submit forgotten password account id
		$scope.askForPasswordReset = function() {
			$scope.success = $scope.error = null;

			$http.post('/auth/forgot', $scope.credentials).success(function(response) {
				// Show user success message and clear form
				$scope.credentials = null;
				$scope.success = response.message;

			}).error(function(response) {
				// Show user error message and clear form
				$scope.credentials = null;
				$scope.error = response.message;
			});
		};

		// Change user password
		$scope.resetUserPassword = function() {
			$scope.success = $scope.error = null;

			$http.post('/auth/reset/' + $stateParams.token, $scope.passwordDetails).success(function(response) {
				// If successful show success message and clear form
				$scope.passwordDetails = null;

				// Attach user profile
				Authentication.user = response;

				// And redirect to the index page
				$location.path('/password/reset/success');
			}).error(function(response) {
				$scope.error = response.message;
			});
		};
	}
]);
'use strict';

angular.module('users').controller('SettingsController', ['$scope', '$http', '$location', 'Users', 'Authentication',
	function($scope, $http, $location, Users, Authentication) {
		$scope.user = Authentication.user;

		// If user is not signed in then redirect back home
		if (!$scope.user) $location.path('/');

		// Check if there are additional accounts 
		$scope.hasConnectedAdditionalSocialAccounts = function(provider) {
			for (var i in $scope.user.additionalProvidersData) {
				return true;
			}

			return false;
		};

		// Check if provider is already in use with current user
		$scope.isConnectedSocialAccount = function(provider) {
			return $scope.user.provider === provider || ($scope.user.additionalProvidersData && $scope.user.additionalProvidersData[provider]);
		};

		// Remove a user social account
		$scope.removeUserSocialAccount = function(provider) {
			$scope.success = $scope.error = null;

			$http.delete('/users/accounts', {
				params: {
					provider: provider
				}
			}).success(function(response) {
				// If successful show success message and clear form
				$scope.success = true;
				$scope.user = Authentication.user = response;
			}).error(function(response) {
				$scope.error = response.message;
			});
		};

		// Update a user profile
		$scope.updateUserProfile = function(isValid) {
			if (isValid) {
				$scope.success = $scope.error = null;
				var user = new Users($scope.user);

				user.$update(function(response) {
					$scope.success = true;
					Authentication.user = response;
				}, function(response) {
					$scope.error = response.data.message;
				});
			} else {
				$scope.submitted = true;
			}
		};

		// Change user password
		$scope.changeUserPassword = function() {
			$scope.success = $scope.error = null;

			$http.post('/users/password', $scope.passwordDetails).success(function(response) {
				// If successful show success message and clear form
				$scope.success = true;
				$scope.passwordDetails = null;
			}).error(function(response) {
				$scope.error = response.message;
			});
		};
	}
]);
'use strict';

// Authentication service for user variables
angular.module('users').factory('Authentication', [
	function() {
		var _this = this;

		_this._data = {
			user: window.user
		};

		return _this._data;
	}
]);
'use strict';

// Users service used for communicating with the users REST endpoint
angular.module('users').factory('Users', ['$resource',
	function($resource) {
		return $resource('users', {}, {
			update: {
				method: 'PUT'
			}
		});
	}
]);