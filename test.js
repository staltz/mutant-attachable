const test = require('tape');
const React = require('React');
const Value = require('mutant/value');
const {attachMutant, detachMutant} = require('./index');
const TestRenderer = require('react-test-renderer');

test('updates component state when mutant stream updates', t => {
  class TestComponent extends React.Component {
    constructor(props) {
      super(props);
      this.state = {age: -1};
      this.watcherRemovers = {age: null};
    }

    componentDidMount() {
      attachMutant(this, 'age');
    }

    componentWillUnmount() {
      detachMutant(this, 'age');
    }

    render() {
      return React.createElement('span', null, `My age is ${this.state.age}`);
    }
  }

  const obs = Value();
  obs.set(20);

  const elem = React.createElement(TestComponent, {age: obs});
  const testRenderer = TestRenderer.create(elem);

  const result1 = testRenderer.toJSON();
  t.ok(result1, 'should have rendered');
  t.equal(result1.children.length, 1, 'should have one child');
  t.equal(result1.children[0], 'My age is 20', 'should show 20');

  obs.set(21);
  testRenderer.update(elem);

  const result2 = testRenderer.toJSON();
  t.ok(result2, 'should have rendered');
  t.equal(result2.children.length, 1, 'should have one child');
  t.equal(result2.children[0], 'My age is 21', 'should show 21');

  t.end();
});

