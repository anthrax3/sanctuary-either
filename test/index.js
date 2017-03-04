'use strict';

var assert = require('assert');

var FL = require('fantasy-land');
var jsc = require('jsverify');
var Z = require('sanctuary-type-classes');

var Either = require('..');

var EitherArb = require('./internal/EitherArb');
var Identity = require('./internal/Identity');
var IdentityArb = require('./internal/IdentityArb');
var equals = require('./internal/equals');
var laws = require('./internal/laws');


var Left = Either.Left;
var Right = Either.Right;


function eq(actual, expected) {
  assert.strictEqual(arguments.length, eq.length);
  assert.strictEqual(Z.toString(actual), Z.toString(expected));
  assert.strictEqual(Z.equals(actual, expected), true);
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
  });

  test('"fantasy-land/equals" method', function() {
    eq(Left(42)[FL.equals].length, 1);
    eq(Left(42)[FL.equals](Left(42)), true);
    eq(Left(42)[FL.equals](Left('42')), false);
    eq(Left(42)[FL.equals](Right(42)), false);

    // Value-based equality:
    eq(Left(0)[FL.equals](Left(-0)), false);
    eq(Left(-0)[FL.equals](Left(0)), false);
    eq(Left(NaN)[FL.equals](Left(NaN)), true);
    eq(Left([1, 2, 3])[FL.equals](Left([1, 2, 3])), true);
  });

  test('"fantasy-land/extend" method', function() {
    eq(Left('abc')[FL.extend].length, 1);
    eq(Left('abc')[FL.extend](function(x) { return x / 2; }), Left('abc'));
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
  });

  test('"fantasy-land/equals" method', function() {
    eq(Right(42)[FL.equals].length, 1);
    eq(Right(42)[FL.equals](Right(42)), true);
    eq(Right(42)[FL.equals](Right('42')), false);
    eq(Right(42)[FL.equals](Left(42)), false);

    // Value-based equality:
    eq(Right(0)[FL.equals](Right(-0)), false);
    eq(Right(-0)[FL.equals](Right(0)), false);
    eq(Right(NaN)[FL.equals](Right(NaN)), true);
    eq(Right([1, 2, 3])[FL.equals](Right([1, 2, 3])), true);
  });

  test('"fantasy-land/extend" method', function() {
    eq(Right(42)[FL.extend].length, 1);
    eq(Right(42)[FL.extend](function(x) { return x.value / 2; }), Right(21));
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

    var setoidLaws = laws.Setoid;

    setoidLaws.reflexivity(
      EitherArb(jsc.string, jsc.falsy)
    );

    setoidLaws.symmetry(
      EitherArb(jsc.bool, jsc.bool),
      EitherArb(jsc.bool, jsc.bool)
    );

    setoidLaws.transitivity(
      EitherArb(jsc.bool, jsc.bool),
      EitherArb(jsc.bool, jsc.bool),
      EitherArb(jsc.bool, jsc.bool)
    );

  });

  suite('Semigroup laws', function() {

    var semigroupLaws = laws.Semigroup(equals);

    semigroupLaws.associativity(
      EitherArb(jsc.string, jsc.string),
      EitherArb(jsc.string, jsc.string),
      EitherArb(jsc.string, jsc.string)
    );

  });

  suite('Functor laws', function() {

    var functorLaws = laws.Functor(equals);

    functorLaws.identity(
      EitherArb(jsc.string, jsc.number)
    );

    functorLaws.composition(
      EitherArb(jsc.string, jsc.number),
      jsc.constant(Math.sqrt),
      jsc.constant(Math.abs)
    );

  });

  suite('Bifunctor laws', function() {

    var bifunctorLaws = laws.Bifunctor(equals);

    bifunctorLaws.identity(
      EitherArb(jsc.string, jsc.number)
    );

    bifunctorLaws.composition(
      EitherArb(jsc.string, jsc.number),
      jsc.constant(Math.sqrt),
      jsc.constant(function(s) { return s.length; }),
      jsc.constant(Math.sqrt),
      jsc.constant(Math.abs)
    );

  });

  suite('Apply laws', function() {

    var applyLaws = laws.Apply(equals);

    applyLaws.composition(
      EitherArb(jsc.string, jsc.constant(Math.sqrt)),
      EitherArb(jsc.string, jsc.constant(Math.abs)),
      EitherArb(jsc.string, jsc.number)
    );

  });

  suite('Applicative laws', function() {

    var applicativeLaws = laws.Applicative(equals, Either);

    applicativeLaws.identity(
      EitherArb(jsc.string, jsc.number)
    );

    applicativeLaws.homomorphism(
      jsc.constant(Math.abs),
      jsc.number
    );

    applicativeLaws.interchange(
      EitherArb(jsc.string, jsc.constant(Math.abs)),
      jsc.number
    );

  });

  suite('Chain laws', function() {

    var chainLaws = laws.Chain(equals);

    chainLaws.associativity(
      EitherArb(jsc.string, jsc.array(jsc.number)),
      jsc.constant(function(xs) { return xs.length > 0 ? Right(xs[0]) : Left('Empty list'); }),
      jsc.constant(squareRoot)
    );

  });

  suite('Monad laws', function() {

    var monadLaws = laws.Monad(equals, Either);

    monadLaws.leftIdentity(
      jsc.constant(squareRoot),
      jsc.number
    );

    monadLaws.rightIdentity(
      EitherArb(jsc.string, jsc.number)
    );

  });

  suite('Alt laws', function() {

    var altLaws = laws.Alt(equals);

    altLaws.associativity(
      EitherArb(jsc.string, jsc.number),
      EitherArb(jsc.string, jsc.number),
      EitherArb(jsc.string, jsc.number)
    );

    altLaws.distributivity(
      EitherArb(jsc.string, jsc.number),
      EitherArb(jsc.string, jsc.number),
      jsc.constant(Math.sqrt)
    );

  });

  suite('Foldable laws', function() {

    var foldableLaws = laws.Foldable(equals);

    foldableLaws.associativity(
      jsc.constant(add_),
      jsc.number,
      EitherArb(jsc.string, jsc.number)
    );

  });

  suite('Traversable laws', function() {

    var traversableLaws = laws.Traversable(equals);

    traversableLaws.naturality(
      jsc.constant(function(right) { return [right.value]; }),
      EitherArb(jsc.string, IdentityArb(jsc.number)),
      jsc.constant(Identity),
      jsc.constant(Array)
    );

    traversableLaws.identity(
      EitherArb(jsc.string, jsc.number),
      jsc.constant(Identity)
    );

    traversableLaws.composition(
      EitherArb(jsc.string, IdentityArb(EitherArb(jsc.string, jsc.number))),
      jsc.constant(Identity),
      jsc.constant(Either)
    );

  });

  suite('Extend laws', function() {

    var extendLaws = laws.Extend(equals);

    extendLaws.associativity(
      EitherArb(jsc.string, jsc.integer),
      jsc.constant(function(either) { return either.value + 1; }),
      jsc.constant(function(either) { return either.value * either.value; })
    );

  });

});
