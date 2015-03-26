import MyLibrary from '../../src/index';

describe('A feature test', () => {
  beforeEach(() => {
    this.lib = new MyLibrary();
    spy(lib, 'mainFn');
    lib.mainFn();
  });

  it('should have been run once', () => {
    expect(this.mainFn).to.have.been.calledOnce;
  });

  it('should have always returned hello', () => {
    expect(this.mainFn).to.have.always.returned('hey!');
  });
});
