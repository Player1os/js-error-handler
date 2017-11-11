// Load npm modules.
import * as lodash from 'lodash'

/**
 * A condition with which to test an error instance. Can be one of:
 * - A constructor function of a subclass of the Error class. The error is tested to be an instance of this subclass.
 * - An object which is tested to match the error.
 * - A function that returns a boolean value based on the encapsulated error as its input.
 */
export type TCondition = Error | object | ((err: Error) => boolean)

/**
 * A callback for handling the error when a condition is matched and the error was not yet handled before.
 */
export type TCallback = (err: Error) => void

/**
 * A class that encapsules an error instance and allows its further handling.
 */
export class ErrorHandler {
	/**
	 * A boolean indicating whether the error was already handled.
	 */
	protected isCaught = false

	/**
	 * Creates a new instance of the Error Handler class.
	 * @param err The error instance to be encapsulated and later handled.
	 */
	public constructor(
		protected err: Error,
	) {}

	/**
	 * Handles all errors, that were not caught before.
	 * @param callback A callback for handling the error, if it is caught.
	 */
	public catch(callback: TCallback): this
	/**
	 * Handles errors, that match the submitted condition or array of conditions.
	 * @param condition A condition or array of conditions to be matched against the encapsulated error.
	 * @param callback A callback for handling the error, if it is caught.
	 */
	public catch(condition: TCondition | TCondition[], callback: TCallback): this
	public catch(condition: TCondition | TCondition[] | TCallback, callback?: TCallback) {
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

	/**
	 * Similar to the catch method but if the error matches the submitted condition, no action is to be taken.
	 * @param condition A condition or array of conditions to be matched against the encapsulated error.
	 */
	public pass(condition: TCondition | TCondition[]) {
		if (this.isCaught) {
			return this
		}

		if (!this.test(condition)) {
			return this
		}
		this.isCaught = true

		return this
	}

	/**
	 * Rethrow the error if it wasn't already handled.
	 */
	public throw() {
		if (!this.isCaught) {
			throw this.err
		}
	}

	/**
	 * An internal method that tests the encapsultated error against a given condition.
	 * @param condition A condition instance to be tested.
	 */
	protected testOne(condition: TCondition) {
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

	/**
	 * An internal method that unified the handling of a single condition and an array of conditions.
	 * @param condition A condition or array of conditions to be matched against the encapsulated error.
	 */
	protected test(condition: TCondition | TCondition[]) {
		return lodash.isArray(condition)
			? condition.some(this.testOne)
			: this.testOne(condition)
	}
}

// A factory function to create instances of the Error Handler class.
export default (err: Error) => {
	return new ErrorHandler(err)
}
