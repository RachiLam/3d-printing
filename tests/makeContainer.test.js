const { expect } = require('chai');
const { makeContainer } = require('../src/makeContainer');
const {
  buildBehaviorsForFunction,
  buildTheyMustBeSomethingForContextTuples,
  whenNotAnIntegerContextTuple,
  itThrowsAnErrorWhenCalledWithExtraParameters,
} = require('./helpers/behaviors');

const {
  theyMustBePositiveIntegers,
  theyMustBePositiveNumbers,
  theyMustBeNonNegativeIntegers,
  theyMustBeValidInnerDimensions,
} = buildBehaviorsForFunction(makeContainer, {
  theyMustBeValidInnerDimensionsForItThrowsAnError: buildTheyMustBeSomethingForContextTuples(
    whenNotAnIntegerContextTuple,
    ['equal to minBottomHoleSideLength', 'must be greater than ref:minBottomHoleSideLength', 1, { minBottomHoleSideLength: 1 }],
    ['less than minBottomHoleSideLength', 'must be greater than ref:minBottomHoleSideLength', 1, { minBottomHoleSideLength: 2 }],
  ),
});

describe('makeContainer', function () {
  describe('parameter validation', function () {
    itThrowsAnErrorWhenCalledWithExtraParameters(makeContainer);

    theyMustBeValidInnerDimensions(
      'innerWidth',
      'innerDepth',
    );

    theyMustBePositiveIntegers(
      'outerHeight',
      'sideLengthMultiple',
    );

    theyMustBePositiveNumbers(
      'minWallThickness',
      'wallThickness',
      'bottomThickness',
      'bottomClearance',
    );

    theyMustBeNonNegativeIntegers(
      'minBottomHoleSideLength',
    );
  });

  context('by default', function () {
    before(function () {
      this.containerMeta = makeContainer();
    });

    it('returns container meta', function () {
      expect(this.containerMeta).to.be.an('object')
        .that.includes.keys([
          'container',
          'debug',
        ]);
    });

    it('returns the container', function () {
      expect(this.containerMeta.container).to.be.an.instanceof(OpenJscadObject);
    });

    it('returns debug information', function () {
      expect(this.containerMeta.debug).to.eql({
        innerBoxSize: [
          20,
          20,
          19,
        ],
        outerBoxSize: [
          22,
          22,
          20,
        ],
        wallThicknessSizes: [
          1,
          1,
          1,
        ],
        bottomHoleSize: [
          5,
          5,
          1,
        ],
      });
    });
  });

  context('when the sideLengthMultiple and minWallThickness are set', function () {
    it('adjusts the wall thicknesses to respect the sideLengthMultiple', function () {
      const { wallThicknessSizes } = makeContainer({
        innerWidth: 11,
        innerDepth: 11,
        sideLengthMultiple: 2,
        minWallThickness: 1,
      }).debug;

      expect(wallThicknessSizes).to.eql([
        1.5,
        1.5,
        1,
      ]);
    });
  });

  context('when wallThickness is set', function () {
    before(function () {
      this.debug = makeContainer({
        innerWidth: 11,
        innerDepth: 11,
        outerHeight: 10,
        bottomThickness: 1,
        bottomClearance: 1,
        sideLengthMultiple: 2,
        minWallThickness: 1,
        wallThickness: 1,
      }).debug;
    });

    it('respects the wallThickness', function () {
      expect(this.debug.wallThicknessSizes).to.eql([
        1,
        1,
        1,
      ]);
    });

    it('adjusts the inner dimensions to respect the sideLengthMultiple', function () {
      expect(this.debug.innerBoxSize).to.eql([
        12,
        12,
        9,
      ]);
    });

    it('adjusts the bottom hole dimensions based on the new inner dimensions', function () {
      expect(this.debug.bottomHoleSize).to.eql([
        10,
        10,
        1,
      ]);
    });
  });

  context('when the bottomClearance is Infinity and the minBottomHoleSideLength is zero', function () {
    it('does not make a bottom hole', function () {
      const { bottomHoleSize } = makeContainer({
        bottomClearance: Infinity,
        minBottomHoleSideLength: 0,
      }).debug;
      expect(bottomHoleSize).to.eql([
        0,
        0,
        1,
      ]);
    });
  });
});
