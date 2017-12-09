# mutant-attachable

**DEPRECATED**: I'm not using neither maintaining this package anymore. It might still be useful to you, though, but I just wanted to let you informed. I plan to use `react-mutant-hoc` instead.

```
yarn add mutant-attachable
```

Utilities functions to call in React component lifecycle hooks to setup observation of [Mutant](https://github.com/mmckegg/mutant) observables. Works even better with TypeScript, but also works with normal JavaScript.

## What problem this package solves

Let's say you have some mutant observables and you pass them to a React component through props:

```jsx
<MyComponent isBlue={computed([state.color], color => color === 'blue')}>
```

Your implementation looks like

```js
class MyComponent extends Component {
    constructor(props) {
        super(props);
        this.state = {isBlue: false};
    }

    componentDidMount() {
        this.removeIsBlue = this.props.isBlue(val => {
            this.setState(prev => ({...prev, isBlue: val}));
        });
    }

    componentWillUnMount() {
        if (this.removeIsBlue) {
            this.removeIsBlue();
            this.removeIsBlue = undefined;
        }
    }

    // ...
}
```

That's just one observable, but what if you have many? **Such tedious wiring** just to get mutant prop `foo` automatically update the component state `foo`.

## Usage

In JavaScript:

```diff
+import {attachMutant, detachMutant} from 'mutant-attachable';

 class MyComponent extends Component {
     constructor(props) {
         super(props);
         this.state = {isBlue: false};
+        this.watcherRemovers = {isBlue: null};
     }

     componentDidMount() {
+        attachMutant(this, 'isBlue');
     }

     componentWillUnMount() {
+        detachMutant(this, 'isBlue');
     }

    // ...
 }
```

In TypeScript:

```diff
+import {MutantAttachable, attachMutant, detachMutant} from 'mutant-attachable';

 // The MutantAttachable<NAMES> interface makes sure you wont make any typo
 // and that the provided NAMES match the props

-class MyComponent extends Component {
+class MyComponent extends Component implements MutantAttachable<'isBlue'> {
     constructor(props) {
         super(props);
+        this.state = {isBlue: false};
+        this.watcherRemovers = {isBlue: null};
     }

     componentDidMount() {
+        attachMutant(this, 'isBlue');
     }

     componentWillUnMount() {
+        detachMutant(this, 'isBlue');
     }

     // ...
 }
```

This tool becomes really useful once you have many mutant streams as props:


```typescript
import {MutantAttachable, attachMutant, detachMutant} from 'mutant-attachable';

class MyComponent extends Component
    implements MutantAttachable<'isBlue' | 'name' | 'age' | 'imageUrl'> {

    constructor(props) {
        super(props);
        this.state = {isBlue: false, name: '', age: 0, imageUrl: ''};
        this.watcherRemovers = {isBlue: null, name: null, age: null, imageUrl: null};
    }

    componentDidMount() {
       attachMutant(this, 'isBlue');
       attachMutant(this, 'name');
       attachMutant(this, 'age');
       attachMutant(this, 'imageUrl');
    }

    componentWillUnMount() {
       detachMutant(this, 'isBlue');
       detachMutant(this, 'name');
       detachMutant(this, 'age');
       detachMutant(this, 'imageUrl');
    }

    // ...
}
```

## API

### `MutantAttachable<'key1' | 'key2' | 'key3' | ...>`

Use this TypeScript interface to make sure your React component can observe mutant
streams correctly in order to update the component state.

Your React component should `implement MutantAttachable<KEYSGOHERE>` where
`KEYSGOHERE` should be a list of mutant streams that will be observed. E.g.
`implement MutantAttachable<'name' | 'imageUrl'>`
Notice that this list of strings is separated by `|`.

### `attachMutant(instance, name, update?)`

Attach a mutant stream to a React component.

Call this function in `componentDidMount` in order to attach the mutant
stream that exists in the props. The values from the stream will be written
to the React component state.

- **param instance**: React component instance (`this` keyword, when inside `componentDidMount`)
- **param name:** string that identifies the mutant stream to be attached.
- **param update:** optional function that takes a value (from the mutant stream) and can call `this.setState` to update the React component state.

### `detachMutant(instance, name)`

Detach a mutant stream from a React component.

Call this function in `componentWillUnmount` in order to detach the mutant
stream from the React component.

- **param instance:** React component instance (`this` keyword, when inside `componentWillUnmount`)
- **param name:** string that identifies the mutant stream to be attached.


