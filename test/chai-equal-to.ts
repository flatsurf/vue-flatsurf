import "chai";

declare global {
  export namespace Chai {
    interface Assertion {
      equalTo(value: any): Assertion;
      equalTo(value: any, epsilon: number): Assertion;
    }
  }
}

export default function(chai: Chai.ChaiStatic, utils: Chai.ChaiUtils) {
  let Assertion = chai.Assertion;

  utils.addMethod(Assertion.prototype, "equalTo", function(this: any, rhs: any, epsilon: number = 0) {
    this.assert(
      this._obj.equalTo(rhs, epsilon),
      "expected #{this} to be equal to #{exp}",
      "expected #{this} not to be equal to #{exp}",
      rhs,
      this._obj,
    );
  });
}
