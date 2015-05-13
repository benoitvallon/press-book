'use strict';

(function() {
  // Pressbooks Controller Spec
  describe('PressbooksController', function() {
    // Initialize global variables
    var PressbooksController,
      scope,
      $httpBackend,
      $stateParams,
      $location;

    // The $resource service augments the response object with methods for updating and deleting the resource.
    // If we were to use the standard toEqual matcher, our tests would fail because the test values would not match
    // the responses exactly. To solve the problem, we define a new toEqualData Jasmine matcher.
    // When the toEqualData matcher compares two objects, it takes only object properties into
    // account and ignores methods.
    beforeEach(function() {
      jasmine.addMatchers({
        toEqualData: function(util, customEqualityTesters) {
          return {
            compare: function(actual, expected) {
              return {
                pass: angular.equals(actual, expected)
              };
            }
          };
        }
      });
    });

    // Then we can start by loading the main application module
    beforeEach(module(ApplicationConfiguration.applicationModuleName));

    // The injector ignores leading and trailing underscores here (i.e. _$httpBackend_).
    // This allows us to inject a service but then attach it to a variable
    // with the same name as the service.
    beforeEach(inject(function($controller, $rootScope, _$location_, _$stateParams_, _$httpBackend_) {
      // Set a new global scope
      scope = $rootScope.$new();

      // Point global variables to injected services
      $stateParams = _$stateParams_;
      $httpBackend = _$httpBackend_;
      $location = _$location_;

      // Initialize the Pressbooks controller.
      PressbooksController = $controller('PressbooksController', {
        $scope: scope
      });
    }));

    it('$scope.find() should create an array with at least one pressbook object fetched from XHR', inject(function(Pressbooks) {
      // Create sample pressbook using the Pressbooks service
      var samplePressbook = new Pressbooks({
        title: 'An Pressbook about MEAN',
        content: 'MEAN rocks!'
      });

      // Create a sample pressbooks array that includes the new pressbook
      var samplePressbooks = [samplePressbook];

      // Set GET response
      $httpBackend.expectGET('pressbooks').respond(samplePressbooks);

      // Run controller functionality
      scope.find();
      $httpBackend.flush();

      // Test scope value
      expect(scope.pressbooks).toEqualData(samplePressbooks);
    }));

    it('$scope.findOne() should create an array with one pressbook object fetched from XHR using a pressbookId URL parameter', inject(function(Pressbooks) {
      // Define a sample pressbook object
      var samplePressbook = new Pressbooks({
        title: 'An Pressbook about MEAN',
        content: 'MEAN rocks!'
      });

      // Set the URL parameter
      $stateParams.pressbookId = '525a8422f6d0f87f0e407a33';

      // Set GET response
      $httpBackend.expectGET(/pressbooks\/([0-9a-fA-F]{24})$/).respond(samplePressbook);

      // Run controller functionality
      scope.findOne();
      $httpBackend.flush();

      // Test scope value
      expect(scope.pressbook).toEqualData(samplePressbook);
    }));

    it('$scope.create() with valid form data should send a POST request with the form input values and then locate to new object URL', inject(function(Pressbooks) {
      // Create a sample pressbook object
      var samplePressbookPostData = new Pressbooks({
        title: 'An Pressbook about MEAN',
        content: 'MEAN rocks!'
      });

      // Create a sample pressbook response
      var samplePressbookResponse = new Pressbooks({
        _id: '525cf20451979dea2c000001',
        title: 'An Pressbook about MEAN',
        content: 'MEAN rocks!'
      });

      // Fixture mock form input values
      scope.title = 'An Pressbook about MEAN';
      scope.content = 'MEAN rocks!';

      // Set POST response
      $httpBackend.expectPOST('pressbooks', samplePressbookPostData).respond(samplePressbookResponse);

      // Run controller functionality
      scope.create();
      $httpBackend.flush();

      // Test form inputs are reset
      expect(scope.title).toEqual('');
      expect(scope.content).toEqual('');

      // Test URL redirection after the pressbook was created
      expect($location.path()).toBe('/pressbooks/' + samplePressbookResponse._id);
    }));

    it('$scope.update() should update a valid pressbook', inject(function(Pressbooks) {
      // Define a sample pressbook put data
      var samplePressbookPutData = new Pressbooks({
        _id: '525cf20451979dea2c000001',
        title: 'An Pressbook about MEAN',
        content: 'MEAN Rocks!'
      });

      // Mock pressbook in scope
      scope.pressbook = samplePressbookPutData;

      // Set PUT response
      $httpBackend.expectPUT(/pressbooks\/([0-9a-fA-F]{24})$/).respond();

      // Run controller functionality
      scope.update();
      $httpBackend.flush();

      // Test URL location to new object
      expect($location.path()).toBe('/pressbooks/' + samplePressbookPutData._id);
    }));

    it('$scope.remove() should send a DELETE request with a valid pressbookId and remove the pressbook from the scope', inject(function(Pressbooks) {
      // Create new pressbook object
      var samplePressbook = new Pressbooks({
        _id: '525a8422f6d0f87f0e407a33'
      });

      // Create new pressbooks array and include the pressbook
      scope.pressbooks = [samplePressbook];

      // Set expected DELETE response
      $httpBackend.expectDELETE(/pressbooks\/([0-9a-fA-F]{24})$/).respond(204);

      // Run controller functionality
      scope.remove(samplePressbook);
      $httpBackend.flush();

      // Test array after successful delete
      expect(scope.pressbooks.length).toBe(0);
    }));
  });
}());