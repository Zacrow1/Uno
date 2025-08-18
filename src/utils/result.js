export class Result {
  constructor(isOk, value) {
    this.isOk = isOk;
    this.value = value;
  }

  static Ok(value) {
    return new Result(true, value);
  }

  static Err(error) {
    return new Result(false, error);
  }

  map(fn) {
    return this.isOk ? Result.Ok(fn(this.value)) : this;
  }

  flatMap(fn) {
    return this.isOk ? fn(this.value) : this;
  }

  getOrElse(defaultValue) {
    return this.isOk ? this.value : defaultValue;
  }
}