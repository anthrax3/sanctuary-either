'use strict';

var jsc = require('jsverify');
var Z = require('sanctuary-type-classes');

var Either = require('..');


//  value :: { value :: a } -> a
function value(o) { return o.value; }


//  EitherArb :: Arbitrary a -> Arbitrary b -> Arbitrary (Either a b)
module.exports = function EitherArb(lArb, rArb) {
  return jsc.oneof(lArb.smap(Either.Left, value, Z.toString),
                   rArb.smap(Either.Right, value, Z.toString));
};
