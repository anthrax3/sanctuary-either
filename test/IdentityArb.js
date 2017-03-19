'use strict';

var Z = require('sanctuary-type-classes');

var Identity = require('./Identity');


//  value :: { value :: a } -> a
function value(o) { return o.value; }


//  IdentityArb :: Arbitrary a -> Arbitrary (Identity a)
module.exports = function IdentityArb(arb) {
  return arb.smap(Identity, value, Z.toString);
};
