'use strict';

var assert = require('assert');

var FL = require('fantasy-land');
var laws = require('fantasy-laws');
var jsc = require('jsverify');
var Identity = require('sanctuary-identity');
var Z = require('sanctuary-type-classes');

var Either = require('..');


var Left = Either.Left;
var Right = Either.Right;


function eq(actual, expected) {
  assert.strictEqual(arguments.length, eq.length);
  assert.strictEqual(Z.toString(actual), Z.toString(expected));
  assert.strictEqual(Z.equals(actual, expected), true);
}

//  EitherArb :: Arbitrary a -> Arbitrary b -> Arbitrary (Either a b)
function EitherArb(lArb, rArb) {
  return jsc.oneof(lArb.smap(Either.Left, value, Z.toString),
                   rArb.smap(Either.Right, value, Z.toString));
}

//  IdentityArb :: Arbitrary a -> Arbitrary (Identity a)
function IdentityArb(arb) {
  return arb.smap(Identity, value, Z.toString);
}

//  add_ :: (Number, Number) -> Number
function add_(x, y) { return x + y; }

//  inc :: Number -> Number
function inc(n) { return n + 1; }

//  squareRoot :: Number -> Either String Number
function squareRoot(n) {
  return n < 0 ? Left('Cannot represent square root of negative number')
               : Right(Math.sqrt(n));
}

//  toUpper :: String -> String
function toUpper(s) { return s.toUpperCase(); }

//  value :: { value :: a } -> a
function value(o) { return o.value; }


suite('Left', function() {

  test('data constructor', function() {
    eq(typeof Left, 'function');
    eq(Left.length, 1);
    eq(Left(42).constructor, Either);
    eq(Left(42).isLeft, true);
    eq(Left(42).isRight, false);
  });

  test('"fantasy-land/alt" method', function() {
    eq(Left(1)[FL.alt].length, 1);
    eq(Left(1)[FL.alt](Left(2)), Left(2));
    eq(Left(1)[FL.alt](Right(2)), Right(2));
  });

  test('"fantasy-land/ap" method', function() {
    eq(Left('abc')[FL.ap].length, 1);
    eq(Left('abc')[FL.ap](Left('xyz')), Left('xyz'));
    eq(Left('abc')[FL.ap](Right(inc)), Left('abc'));
  });

  test('"fantasy-land/bimap" method', function() {
    eq(Left('abc')[FL.bimap].length, 2);
    eq(Left('abc')[FL.bimap](toUpper, inc), Left('ABC'));
  });

  test('"fantasy-land/chain" method', function() {
    eq(Left('abc')[FL.chain].length, 1);
    eq(Left('abc')[FL.chain](squareRoot), Left('abc'));
  });

  test('"fantasy-land/concat" method', function() {
    eq(Left('abc')[FL.concat].length, 1);
    eq(Left('abc')[FL.concat](Left('def')), Left('abcdef'));
    eq(Left('abc')[FL.concat](Right('xyz')), Right('xyz'));

    eq(Z.Semigroup.test(Left('abc')), true);
    eq(Z.Semigroup.test(Left(123)), false);
  });

  test('"fantasy-land/equals" method', function() {
    eq(Left(42)[FL.equals].length, 1);
    eq(Left(42)[FL.equals](Left(42)), true);
    eq(Left(42)[FL.equals](Left('42')), false);
    eq(Left(42)[FL.equals](Right(42)), false);

    // Value-based equality:
    eq(Left(0)[FL.equals](Left(-0)), true);
    eq(Left(-0)[FL.equals](Left(0)), true);
    eq(Left(NaN)[FL.equals](Left(NaN)), true);
    eq(Left([1, 2, 3])[FL.equals](Left([1, 2, 3])), true);
  });

  test('"fantasy-land/extend" method', function() {
    eq(Left('abc')[FL.extend].length, 1);
    eq(Left('abc')[FL.extend](function(x) { return x / 2; }), Left('abc'));
  });

  test('"fantasy-land/lte" method', function() {
    eq(Z.lte(Left(1), Right(1)), true);
    eq(Z.lte(Left(1), Left(0)), false);
    eq(Z.lte(Left(1), Left(1)), true);
    eq(Z.lte(Left(1), Left(2)), true);

    eq(Z.Ord.test(Left(1)), true);
    eq(Z.Ord.test(Left(Math.sqrt)), false);
  });

  test('"fantasy-land/map" method', function() {
    eq(Left('abc')[FL.map].length, 1);
    eq(Left('abc')[FL.map](Math.sqrt), Left('abc'));
  });

  test('"fantasy-land/reduce" method', function() {
    eq(Left('abc')[FL.reduce].length, 2);
    eq(Left('abc')[FL.reduce](function(x, y) { return x - y; }, 42), 42);
  });

  test('"toString" method', function() {
    eq(Left('abc').toString.length, 0);
    eq(Left('abc').toString(), 'Left("abc")');
  });

  test('"inspect" method', function() {
    eq(Left('abc').inspect.length, 0);
    eq(Left('abc').inspect(), 'Left("abc")');
  });

});

suite('Right', function() {

  test('data constructor', function() {
    eq(typeof Right, 'function');
    eq(Right.length, 1);
    eq(Right(42).constructor, Either);
    eq(Right(42).isLeft, false);
    eq(Right(42).isRight, true);
  });

  test('"fantasy-land/alt" method', function() {
    eq(Right(1)[FL.alt].length, 1);
    eq(Right(1)[FL.alt](Left(2)), Right(1));
    eq(Right(1)[FL.alt](Right(2)), Right(1));
  });

  test('"fantasy-land/ap" method', function() {
    eq(Right(42)[FL.ap].length, 1);
    eq(Right(42)[FL.ap](Left('abc')), Left('abc'));
    eq(Right(42)[FL.ap](Right(inc)), Right(43));
  });

  test('"fantasy-land/bimap" method', function() {
    eq(Right(42)[FL.bimap].length, 2);
    eq(Right(42)[FL.bimap](toUpper, inc), Right(43));
  });

  test('"fantasy-land/chain" method', function() {
    eq(Right(25)[FL.chain].length, 1);
    eq(Right(25)[FL.chain](squareRoot), Right(5));
  });

  test('"fantasy-land/concat" method', function() {
    eq(Right('abc')[FL.concat].length, 1);
    eq(Right('abc')[FL.concat](Left('xyz')), Right('abc'));
    eq(Right('abc')[FL.concat](Right('def')), Right('abcdef'));

    eq(Z.Semigroup.test(Right('abc')), true);
    eq(Z.Semigroup.test(Right(123)), false);
  });

  test('"fantasy-land/equals" method', function() {
    eq(Right(42)[FL.equals].length, 1);
    eq(Right(42)[FL.equals](Right(42)), true);
    eq(Right(42)[FL.equals](Right('42')), false);
    eq(Right(42)[FL.equals](Left(42)), false);

    // Value-based equality:
    eq(Right(0)[FL.equals](Right(-0)), true);
    eq(Right(-0)[FL.equals](Right(0)), true);
    eq(Right(NaN)[FL.equals](Right(NaN)), true);
    eq(Right([1, 2, 3])[FL.equals](Right([1, 2, 3])), true);
  });

  test('"fantasy-land/extend" method', function() {
    eq(Right(42)[FL.extend].length, 1);
    eq(Right(42)[FL.extend](function(x) { return x.value / 2; }), Right(21));
  });

  test('"fantasy-land/lte" method', function() {
    eq(Z.lte(Right(1), Left(1)), false);
    eq(Z.lte(Right(1), Right(0)), false);
    eq(Z.lte(Right(1), Right(1)), true);
    eq(Z.lte(Right(1), Right(2)), true);

    eq(Z.Ord.test(Right(1)), true);
    eq(Z.Ord.test(Right(Math.sqrt)), false);
  });

  test('"fantasy-land/map" method', function() {
    eq(Right(9)[FL.map].length, 1);
    eq(Right(9)[FL.map](Math.sqrt), Right(3));
  });

  test('"fantasy-land/reduce" method', function() {
    eq(Right(5)[FL.reduce].length, 2);
    eq(Right(5)[FL.reduce](function(x, y) { return x - y; }, 42), 37);
  });

  test('"toString" method', function() {
    eq(Right([1, 2, 3]).toString.length, 0);
    eq(Right([1, 2, 3]).toString(), 'Right([1, 2, 3])');
  });

  test('"inspect" method', function() {
    eq(Right([1, 2, 3]).inspect.length, 0);
    eq(Right([1, 2, 3]).inspect(), 'Right([1, 2, 3])');
  });

});

suite('Either', function() {

  suite('Setoid laws', function() {

    test('reflexivity',
         laws.Setoid.reflexivity(
           EitherArb(jsc.string, jsc.falsy)
         ));

    test('symmetry',
         laws.Setoid.symmetry(
           EitherArb(jsc.bool, jsc.bool),
           EitherArb(jsc.bool, jsc.bool)
         ));

    test('transitivity',
         laws.Setoid.transitivity(
           EitherArb(jsc.bool, jsc.bool),
           EitherArb(jsc.bool, jsc.bool),
           EitherArb(jsc.bool, jsc.bool)
         ));

  });

  suite('Semigroup laws', function() {

    test('associativity',
         laws.Semigroup(Z.equals).associativity(
           EitherArb(jsc.string, jsc.string),
           EitherArb(jsc.string, jsc.string),
           EitherArb(jsc.string, jsc.string)
         ));

  });

  suite('Functor laws', function() {

    test('identity',
         laws.Functor(Z.equals).identity(
           EitherArb(jsc.string, jsc.number)
         ));

    test('composition',
         laws.Functor(Z.equals).composition(
           EitherArb(jsc.string, jsc.number),
           jsc.constant(Math.sqrt),
           jsc.constant(Math.abs)
         ));

  });

  suite('Bifunctor laws', function() {

    test('identity',
         laws.Bifunctor(Z.equals).identity(
           EitherArb(jsc.string, jsc.number)
         ));

    test('composition',
         laws.Bifunctor(Z.equals).composition(
           EitherArb(jsc.string, jsc.number),
           jsc.constant(Math.sqrt),
           jsc.constant(function(s) { return s.length; }),
           jsc.constant(Math.sqrt),
           jsc.constant(Math.abs)
         ));

  });

  suite('Apply laws', function() {

    test('composition',
         laws.Apply(Z.equals).composition(
           EitherArb(jsc.string, jsc.constant(Math.sqrt)),
           EitherArb(jsc.string, jsc.constant(Math.abs)),
           EitherArb(jsc.string, jsc.number)
         ));

  });

  suite('Applicative laws', function() {

    test('identity',
         laws.Applicative(Z.equals, Either).identity(
           EitherArb(jsc.string, jsc.number)
         ));

    test('homomorphism',
         laws.Applicative(Z.equals, Either).homomorphism(
           jsc.constant(Math.abs),
           jsc.number
         ));

    test('interchange',
         laws.Applicative(Z.equals, Either).interchange(
           EitherArb(jsc.string, jsc.constant(Math.abs)),
           jsc.number
         ));

  });

  suite('Chain laws', function() {

    test('associativity',
         laws.Chain(Z.equals).associativity(
           EitherArb(jsc.string, jsc.array(jsc.number)),
           jsc.constant(function(xs) { return xs.length > 0 ? Right(xs[0]) : Left('Empty list'); }),
           jsc.constant(squareRoot)
         ));

  });

  suite('Monad laws', function() {

    test('left identity',
         laws.Monad(Z.equals, Either).leftIdentity(
           jsc.constant(squareRoot),
           jsc.number
         ));

    test('right identity',
         laws.Monad(Z.equals, Either).rightIdentity(
           EitherArb(jsc.string, jsc.number)
         ));

  });

  suite('Alt laws', function() {

    test('associativity',
         laws.Alt(Z.equals).associativity(
           EitherArb(jsc.string, jsc.number),
           EitherArb(jsc.string, jsc.number),
           EitherArb(jsc.string, jsc.number)
         ));

    test('distributivity',
         laws.Alt(Z.equals).distributivity(
           EitherArb(jsc.string, jsc.number),
           EitherArb(jsc.string, jsc.number),
           jsc.constant(Math.sqrt)
         ));

  });

  suite('Foldable laws', function() {

    test('associativity',
         laws.Foldable(Z.equals).associativity(
           jsc.constant(add_),
           jsc.number,
           EitherArb(jsc.string, jsc.number)
         ));

  });

  suite('Traversable laws', function() {

    test('naturality',
         laws.Traversable(Z.equals).naturality(
           jsc.constant(function(right) { return [right.value]; }),
           EitherArb(jsc.string, IdentityArb(jsc.number)),
           jsc.constant(Identity),
           jsc.constant(Array)
         ));

    test('identity',
         laws.Traversable(Z.equals).identity(
           EitherArb(jsc.string, jsc.number),
           jsc.constant(Identity)
         ));

    test('composition',
         laws.Traversable(Z.equals).composition(
           EitherArb(jsc.string, IdentityArb(EitherArb(jsc.string, jsc.number))),
           jsc.constant(Identity),
           jsc.constant(Either)
         ));

  });

  suite('Extend laws', function() {

    test('associativity',
         laws.Extend(Z.equals).associativity(
           EitherArb(jsc.string, jsc.integer),
           jsc.constant(function(either) { return either.value + 1; }),
           jsc.constant(function(either) { return either.value * either.value; })
         ));

  });

});
