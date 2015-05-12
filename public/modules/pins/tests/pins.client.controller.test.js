'use strict';

(function() {
  // Pins Controller Spec
  describe('PinsController', function() {
    // Initialize global variables
    var PinsController,
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

      // Initialize the Pins controller.
      PinsController = $controller('PinsController', {
        $scope: scope
      });
    }));

    it('$scope.find() should create an array with at least one pin object fetched from XHR', inject(function(Pins) {
      // Create sample pin using the Pins service
      var samplePin = new Pins({
        title: 'An Pin about MEAN',
        content: 'MEAN rocks!'
      });

      // Create a sample pins array that includes the new pin
      var samplePins = [samplePin];

      // Set GET response
      $httpBackend.expectGET('pins').respond(samplePins);

      // Run controller functionality
      scope.find();
      $httpBackend.flush();

      // Test scope value
      expect(scope.pins).toEqualData(samplePins);
    }));

    it('$scope.findOne() should create an array with one pin object fetched from XHR using a pinId URL parameter', inject(function(Pins) {
      // Define a sample pin object
      var samplePin = new Pins({
        title: 'An Pin about MEAN',
        content: 'MEAN rocks!'
      });

      // Set the URL parameter
      $stateParams.pinId = '525a8422f6d0f87f0e407a33';

      // Set GET response
      $httpBackend.expectGET(/pins\/([0-9a-fA-F]{24})$/).respond(samplePin);

      // Run controller functionality
      scope.findOne();
      $httpBackend.flush();

      // Test scope value
      expect(scope.pin).toEqualData(samplePin);
    }));

    it('$scope.create() with valid form data should send a POST request with the form input values and then locate to new object URL', inject(function(Pins) {
      // Create a sample pin object
      var samplePinPostData = new Pins({
        title: 'An Pin about MEAN',
        content: 'MEAN rocks!'
      });

      // Create a sample pin response
      var samplePinResponse = new Pins({
        _id: '525cf20451979dea2c000001',
        title: 'An Pin about MEAN',
        content: 'MEAN rocks!'
      });

      // Fixture mock form input values
      scope.title = 'An Pin about MEAN';
      scope.content = 'MEAN rocks!';

      // Set POST response
      $httpBackend.expectPOST('pins', samplePinPostData).respond(samplePinResponse);

      // Run controller functionality
      scope.create();
      $httpBackend.flush();

      // Test form inputs are reset
      expect(scope.title).toEqual('');
      expect(scope.content).toEqual('');

      // Test URL redirection after the pin was created
      expect($location.path()).toBe('/pins/' + samplePinResponse._id);
    }));

    it('$scope.update() should update a valid pin', inject(function(Pins) {
      // Define a sample pin put data
      var samplePinPutData = new Pins({
        _id: '525cf20451979dea2c000001',
        title: 'An Pin about MEAN',
        content: 'MEAN Rocks!'
      });

      // Mock pin in scope
      scope.pin = samplePinPutData;

      // Set PUT response
      $httpBackend.expectPUT(/pins\/([0-9a-fA-F]{24})$/).respond();

      // Run controller functionality
      scope.update();
      $httpBackend.flush();

      // Test URL location to new object
      expect($location.path()).toBe('/pins/' + samplePinPutData._id);
    }));

    it('$scope.remove() should send a DELETE request with a valid pinId and remove the pin from the scope', inject(function(Pins) {
      // Create new pin object
      var samplePin = new Pins({
        _id: '525a8422f6d0f87f0e407a33'
      });

      // Create new pins array and include the pin
      scope.pins = [samplePin];

      // Set expected DELETE response
      $httpBackend.expectDELETE(/pins\/([0-9a-fA-F]{24})$/).respond(204);

      // Run controller functionality
      scope.remove(samplePin);
      $httpBackend.flush();

      // Test array after successful delete
      expect(scope.pins.length).toBe(0);
    }));
  });
}());