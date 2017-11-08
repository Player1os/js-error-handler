type TCondition = Error | object | ((err: Error) => boolean)
type TCallback = (err: Error) => void
class ErrorHandler {
	protected isCaught = false

	constructor(
		protected err: Error,
	) {}

	testOne(condition: TCondition) {
		if (typeof condition === 'object') {
			return lodash.isMatch(this.err, condition)
		}

		if (typeof condition !== 'function') {
			return false
		}

		if (this.err instanceof condition) {
			return true
		}

		return Boolean(condition(this.err))
	}

	test(condition: TCondition | TCondition[]) {
		return lodash.isArray(condition)
			? condition.some(this.testOne)
			: this.testOne(condition)
	}

	catch(callback: TCallback): this
	catch(condition: TCondition | TCondition[], callback: TCallback): this
	catch(condition: TCondition | TCondition[] | TCallback, callback?: TCallback) {
		if (this.isCaught) {
			return this
		}

		if (arguments.length === 2) {
			if (!this.test(condition)) {
				return this
			}
		}
		this.isCaught = true

		if (arguments.length === 1) {
			(condition as TCallback)(this.err)
		} else if (callback !== undefined) {
			callback(this.err)
		}

		return this
	}

	pass(condition: TCondition | TCondition[]) {
		if (this.isCaught) {
			return this
		}

		if (!this.test(condition)) {
			return this
		}
		this.isCaught = true

		return this
	}

	throw() {
		if (!this.isCaught) {
			throw this.err
		}
	}
}

const handleError = (err: Error) => {
	return new ErrorHandler(err)
}

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

try {
	someErrorProneFunction()
} catch (err) {
	// This would rethrow if the error specifically doesn't match error type
	handleError(err) // tslint:disable-line
		.pass(ErrorType) // do nothing for the following error typ
		.throw()
}

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
