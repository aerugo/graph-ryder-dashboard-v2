'use strict';

describe('Component: GraphViewComponent', function() {
  // load the controller's module
  beforeEach(module('graphRyderDashboardApp.graphView'));

  var GraphViewComponent;

  // Initialize the controller and a mock scope
  beforeEach(inject(function($componentController) {
    GraphViewComponent = $componentController('graphView', {});
  }));

  it('should ...', function() {
    expect(1).to.equal(1);
  });
});
