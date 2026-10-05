import { base64ByteLength, fitWithin } from './resize-image';

describe('fitWithin', () => {
  it('keeps small images as they are', () => {
    expect(fitWithin(800, 600)).toEqual({ width: 800, height: 600 });
  });

  it('scales a tall screenshot to 1600 px on its longest side', () => {
    expect(fitWithin(1080, 2400)).toEqual({ width: 720, height: 1600 });
  });

  it('scales a wide image keeping the ratio', () => {
    expect(fitWithin(3200, 1600)).toEqual({ width: 1600, height: 800 });
  });
});

describe('base64ByteLength', () => {
  it('accounts for padding', () => {
    expect(base64ByteLength('TWFu')).toBe(3);
    expect(base64ByteLength('TWE=')).toBe(2);
    expect(base64ByteLength('TQ==')).toBe(1);
  });
});
