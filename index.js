/*
         _______    ___    _________    ___   ___    _______    ______
        /  ____/\  /  /\  /__   ___/\  /  /\ /  /\  /  ____/\  /  __  \
       /  /\___\/ /  / /  \_/  /\__\/ /  /_//  / / /  /\___\/ /  /\/  /\
      /  ____/\  /  / /    /  / /    /  ___   / / /  ____/\  /      _/ /
     /  /\___\/ /  / /    /  / /    /  /\_/  / / /  /\___\/ /  /|  |\\/
    /______/\  /__/ /    /__/ /    /__/ //__/ / /______/\  /__/ |__| |
    \______\/  \__\/     \__\/     \__\/ \__\/  \______\/  \__\/ \__\|
                                                                            */

//. # sanctuary-either
//.
//. The Either type represents values with two possibilities: a value of type
//. `Either a b` is either a Left whose value is of type `a` or a Right whose
//. value is of type `b`.
//.
//. `Either a b` satisfies the following [Fantasy Land][] specifications:
//.
//.   - [Setoid][]
//.   - [Semigroup][] (if `a` and `b` satisfy Semigroup)
//.   - [Functor][]
//.   - [Bifunctor][]
//.   - [Apply][]
//.   - [Applicative][]
//.   - [Chain][]
//.   - [Monad][]
//.   - [Alt][]
//.   - [Foldable][]
//.   - [Traversable][]
//.   - [Extend][]

(function(f) {

  'use strict';

  if (typeof module === 'object' && typeof module.exports === 'object') {
    module.exports = f(require('sanctuary-type-classes'));
  } else if (typeof define === 'function' && define.amd != null) {
    define(['sanctuary-type-classes'], f);
  } else {
    self.sanctuaryEither = f(self.sanctuaryTypeClasses);
  }

}(function(Z) {

  'use strict';

  //# Either :: TypeRep Either
  //.
  //. The [type representative][] for the Either type.
  var Either = {prototype: _Either.prototype};

  Either.prototype.constructor = Either;

  function _Either(tag, value) {
    this.isLeft = tag === 'Left';
    this.isRight = tag === 'Right';
    this.value = value;
  }

  //# Either.Left :: a -> Either a b
  //.
  //. Takes a value of any type and returns a Left with the given value.
  //.
  //. ```javascript
  //. > Either.Left('Cannot divide by zero')
  //. Left('Cannot divide by zero')
  //. ```
  function Left(x) {
    return new _Either('Left', x);
  }
  Either.Left = Left;

  //# Either.Right :: b -> Either a b
  //.
  //. Takes a value of any type and returns a Right with the given value.
  //.
  //. ```javascript
  //. > Either.Right(42)
  //. Right(42)
  //. ```
  function Right(x) {
    return new _Either('Right', x);
  }
  Either.Right = Right;

  //# Either.@@type :: String
  //.
  //. Either type identifier, `'sanctuary/Either'`.
  Either['@@type'] = 'sanctuary/Either';

  //# Either.fantasy-land/of :: b -> Either a b
  //.
  //. Takes a value of any type and returns a Right with the given value.
  //.
  //. ```javascript
  //. > Z.of(Either, 42)
  //. Right(42)
  //. ```
  Either['fantasy-land/of'] = Right;

  //# Either#isLeft :: Either a b ~> Boolean
  //.
  //. `true` if `this` is a Left; `false` if `this` is a Right.
  //.
  //. ```javascript
  //. > Left('Cannot divide by zero').isLeft
  //. true
  //.
  //. > Right(42).isLeft
  //. false
  //. ```

  //# Either#isRight :: Either a b ~> Boolean
  //.
  //. `true` if `this` is a Right; `false` if `this` is a Left.
  //.
  //. ```javascript
  //. > Right(42).isRight
  //. true
  //.
  //. > Left('Cannot divide by zero').isRight
  //. false
  //. ```

  //# Either#toString :: Either a b ~> () -> String
  //.
  //. Returns the string representation of the Either.
  //.
  //. ```javascript
  //. > Z.toString(Left('Cannot divide by zero'))
  //. 'Left("Cannot divide by zero")'
  //.
  //. > Z.toString(Right([1, 2, 3]))
  //. 'Right([1, 2, 3])'
  //. ```
  Either.prototype.toString = function() {
    return (this.isLeft ? 'Left' : 'Right') +
           '(' + Z.toString(this.value) + ')';
  };

  //# Either#inspect :: Either a b ~> () -> String
  //.
  //. Returns the string representation of the Either. This method is used by
  //. `util.inspect` and the REPL to format a Either for display.
  //.
  //. See also [`Either#toString`][].
  //.
  //. ```javascript
  //. > Left('Cannot divide by zero').inspect()
  //. 'Left("Cannot divide by zero")'
  //.
  //. > Right([1, 2, 3]).inspect()
  //. 'Right([1, 2, 3])'
  //. ```
  Either.prototype.inspect = function() { return this.toString(); };

  //# Either#fantasy-land/equals :: Either a b ~> Either a b -> Boolean
  //.
  //. Takes a value of the same type and returns `true` if:
  //.
  //.   - it is a Left and `this` is a Left, and their values are equal
  //.     according to [`equals`](#equals); or
  //.
  //.   - it is a Right and `this` is a Right, and their values are equal
  //.     according to [`equals`](#equals).
  //.
  //. ```javascript
  //. > Z.equals(Right([1, 2, 3]), Right([1, 2, 3]))
  //. true
  //.
  //. > Z.equals(Right([1, 2, 3]), Left([1, 2, 3]))
  //. false
  //. ```
  Either.prototype['fantasy-land/equals'] = function(other) {
    return other.isLeft === this.isLeft && Z.equals(other.value, this.value);
  };

  //# Either#fantasy-land/concat :: (Semigroup a, Semigroup b) => Either a b ~> Either a b -> Either a b
  //.
  //. Returns the result of concatenating two Either values of the same type.
  //. `a` must have a [Semigroup][], as must `b`.
  //.
  //. If `this` is a Left and the argument is a Left, this method returns a
  //. Left whose value is the result of concatenating this Left's value and
  //. the given Left's value.
  //.
  //. If `this` is a Right and the argument is a Right, this method returns a
  //. Right whose value is the result of concatenating this Right's value and
  //. the given Right's value.
  //.
  //. Otherwise, this method returns the Right.
  //.
  //. ```javascript
  //. > Z.concat(Left('abc'), Left('def'))
  //. Left('abcdef')
  //.
  //. > Z.concat(Right([1, 2, 3]), Right([4, 5, 6]))
  //. Right([1, 2, 3, 4, 5, 6])
  //.
  //. > Z.concat(Left('abc'), Right([1, 2, 3]))
  //. Right([1, 2, 3])
  //.
  //. > Z.concat(Right([1, 2, 3]), Left('abc'))
  //. Right([1, 2, 3])
  //. ```
  Either.prototype['fantasy-land/concat'] = function(other) {
    return this.isLeft ?
      other.isLeft ? Left(Z.concat(this.value, other.value)) : other :
      other.isLeft ? this : Right(Z.concat(this.value, other.value));
  };

  //# Either#fantasy-land/map :: Either a b ~> (b -> c) -> Either a c
  //.
  //. Takes a function and returns `this` if `this` is a Left; otherwise it
  //. returns a Right whose value is the result of applying the function to
  //. this Right's value.
  //.
  //. See also [`Either#fantasy-land/bimap`][].
  //.
  //. ```javascript
  //. > Z.map(Math.sqrt, Left('Cannot divide by zero'))
  //. Left('Cannot divide by zero')
  //.
  //. > Z.map(Math.sqrt, Right(9))
  //. Right(3)
  //. ```
  Either.prototype['fantasy-land/map'] = function(f) {
    return this.isRight ? Right(f(this.value)) : this;
  };

  //# Either#fantasy-land/bimap :: Either a b ~> (a -> c, b -> d) -> Either c d
  //.
  //. Takes two functions and returns:
  //.
  //.   - a Left whose value is the result of applying the first function
  //.     to this Left's value if `this` is a Left; otherwise
  //.
  //.   - a Right whose value is the result of applying the second function
  //.     to this Right's value.
  //.
  //. Similar to [`Either#fantasy-land/map`][], but supports mapping over the
  //. left side as well as the right side.
  //.
  //. ```javascript
  //. > Z.bimap(s => s.toUpperCase(), n => n + 1, Left('abc'))
  //. Left('ABC')
  //.
  //. > Z.bimap(s => s.toUpperCase(), n => n + 1, Right(42))
  //. Right(43)
  //. ```
  Either.prototype['fantasy-land/bimap'] = function(f, g) {
    return this.isLeft ? Left(f(this.value)) : Right(g(this.value));
  };

  //# Either#fantasy-land/ap :: Either a b ~> Either a (b -> c) -> Either a c
  //.
  //. Takes an Either and returns a Left unless `this` is a Right *and* the
  //. argument is a Right, in which case it returns a Right whose value is
  //. the result of applying the given Right's value to this Right's value.
  //.
  //. ```javascript
  //. > Z.ap(Left('No such function'), Left('Cannot divide by zero'))
  //. Left('No such function')
  //.
  //. > Z.ap(Left('No such function'), Right(9))
  //. Left('No such function')
  //.
  //. > Z.ap(Right(Math.sqrt), Left('Cannot divide by zero'))
  //. Left('Cannot divide by zero')
  //.
  //. > Z.ap(Right(Math.sqrt), Right(9))
  //. Right(3)
  //. ```
  Either.prototype['fantasy-land/ap'] = function(other) {
    return other.isRight ? Z.map(other.value, this) : other;
  };

  //# Either#fantasy-land/chain :: Either a b ~> (b -> Either a c) -> Either a c
  //.
  //. Takes a function and returns `this` if `this` is a Left; otherwise
  //. it returns the result of applying the function to this Right's value.
  //.
  //. ```javascript
  //. > global.sqrt = n =>
  //. .   n < 0 ? Left('Cannot represent square root of negative number')
  //. .         : Right(Math.sqrt(n))
  //. sqrt
  //.
  //. > Z.chain(sqrt, Left('Cannot divide by zero'))
  //. Left('Cannot divide by zero')
  //.
  //. > Z.chain(sqrt, Right(-1))
  //. Left('Cannot represent square root of negative number')
  //.
  //. > Z.chain(sqrt, Right(25))
  //. Right(5)
  //. ```
  Either.prototype['fantasy-land/chain'] = function(f) {
    return this.isRight ? f(this.value) : this;
  };

  //# Either#fantasy-land/alt :: Either a b ~> Either a b -> Either a b
  //.
  //. Chooses between `this` and the other Either provided as an argument.
  //. Returns `this` if `this` is a Right; the other Either otherwise.
  //.
  //. ```javascript
  //. > Z.alt(Left('A'), Left('B'))
  //. Left('B')
  //.
  //. > Z.alt(Left('C'), Right(1))
  //. Right(1)
  //.
  //. > Z.alt(Right(2), Left('D'))
  //. Right(2)
  //.
  //. > Z.alt(Right(3), Right(4))
  //. Right(3)
  //. ```
  Either.prototype['fantasy-land/alt'] = function(other) {
    return this.isRight ? this : other;
  };

  //# Either#fantasy-land/reduce :: Either a b ~> ((c, b) -> c, c) -> c
  //.
  //. Takes a function and an initial value of any type, and returns:
  //.
  //.   - the initial value if `this` is a Left; otherwise
  //.
  //.   - the result of applying the function to the initial value and this
  //.     Right's value.
  //.
  //. ```javascript
  //. > Z.reduce(Math.pow, 10, Left('Cannot divide by zero'))
  //. 10
  //.
  //. > Z.reduce(Math.pow, 10, Right(3))
  //. 1000
  //. ```
  Either.prototype['fantasy-land/reduce'] = function(f, x) {
    return this.isRight ? f(x, this.value) : x;
  };

  //# Either#fantasy-land/traverse :: Applicative f => Either a b ~> (TypeRep f, b -> f c) -> f (Either a c)
  //.
  //. Takes the type representative of some [Applicative][] and a function
  //. which returns a value of that Applicative, and returns:
  //.
  //.   - the result of applying the type representative's [`of`][] function to
  //.     `this` if `this` is a Left; otherwise
  //.
  //.   - the result of mapping [`Right`](#Right) over the result of applying
  //.     the first function to this Right's value.
  //.
  //. ```javascript
  //. > Z.traverse(Array, s => s.split(' '), Left('Request failed'))
  //. [Left('Request failed')]
  //.
  //. > Z.traverse(Array, s => s.split(' '), Right('foo bar baz'))
  //. [Right('foo'), Right('bar'), Right('baz')]
  //. ```
  Either.prototype['fantasy-land/traverse'] = function(typeRep, f) {
    return this.isRight ? Z.map(Right, f(this.value)) : Z.of(typeRep, this);
  };

  //# Either#fantasy-land/extend :: Either a b ~> (Either a b -> c) -> Either a c
  //.
  //. Takes a function and returns `this` if `this` is a Left; otherwise it
  //. returns a Right whose value is the result of applying the function to
  //. `this`.
  //.
  //. ```javascript
  //. > Z.extend(x => x.value + 1, Left('Cannot divide by zero'))
  //. Left('Cannot divide by zero')
  //.
  //. > Z.extend(x => x.value + 1, Right(42))
  //. Right(43)
  //. ```
  Either.prototype['fantasy-land/extend'] = function(f) {
    return this.isLeft ? this : Right(f(this));
  };

  return Either;

}));

//. [Alt]:                          v:fantasyland/fantasy-land#alt
//. [Applicative]:                  v:fantasyland/fantasy-land#applicative
//. [Apply]:                        v:fantasyland/fantasy-land#apply
//. [Bifunctor]:                    v:fantasyland/fantasy-land#bifunctor
//. [Chain]:                        v:fantasyland/fantasy-land#chain
//. [Extend]:                       v:fantasyland/fantasy-land#extend
//. [Fantasy Land]:                 v:fantasyland/fantasy-land
//. [Foldable]:                     v:fantasyland/fantasy-land#foldable
//. [Functor]:                      v:fantasyland/fantasy-land#functor
//. [Monad]:                        v:fantasyland/fantasy-land#monad
//. [Semigroup]:                    v:fantasyland/fantasy-land#semigroup
//. [Setoid]:                       v:fantasyland/fantasy-land#setoid
//. [Traversable]:                  v:fantasyland/fantasy-land#traversable
//. [`Either#fantasy-land/bimap`]:  #Either.prototype.fantasy-land/bimap
//. [`Either#fantasy-land/map`]:    #Either.prototype.fantasy-land/map
//. [`Either#toString`]:            #Either.prototype.toString
//. [`of`]:                         v:fantasyland/fantasy-land#of-method
//. [type representative]:          https://sanctuary.js.org/#type-representatives
