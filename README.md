# JS Error Handler

## Usage example 1

```
try {
	someErrorProneFunction()
} catch (err) {
	handleError(err) // tslint:disable-line
		.catch(ErrorType, (err) => {
			console.error('bad error 1', err.message)
		})
		.catch({ message: 'lol-wut' }, () => {
			console.error('bad error 2', err.message)
		})
		.catch((err) => { return (err.message.length > 5) && (err.data.p === 8) }, (err) => {
			console.error('bad error 3', err.message)
		})
		.catch([ErrorType1, ErrorType2], () => {
			console.error('bad error 4', err.message)
		})
		.catch([{ message: 'lol-wut' }, { l: 5, message: 'lol-wut-mate' }], () => {
			console.error('bad error 5', err.message)
		})
		.catch([(err) => { return (err.message.length > 5) && (err.data.p === 8) }, (err) => { return err.d === 'z' }], (err) => {
			console.error('bad error 6', err.message)
		})
		.catch([(err) => { return (err.message.length > 5) && (err.data.p === 8) }, ErrorType3, { l: 'z' }], (err) => {
			console.error('bad error 7', err.message)
		})
		.catch(ErrorType5) // do nothing for the following error typ
		.throw()
} // tslint:disable-line
```

## Usage example 2

```
try {
	someErrorProneFunction()
} catch (err) {
	// This would rethrow if the error specifically doesn't match error type
	handleError(err) // tslint:disable-line
		.pass(ErrorType) // do nothing for the following error typ
		.throw()
}
```

## Usage example 3

```
try {
	someErrorProneFunction()
} catch (err) {
	handleError(err) // tslint:disable-line
		.catch(ErrorType, () => {
			console.error('bad error', err.message)
		})
		.catch(() => {
			console.error('general case not the error type', err.message)
		})
}
```
