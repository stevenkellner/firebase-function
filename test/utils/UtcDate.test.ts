import { UtcDate } from '../../src';
import { expect } from '../../testSrc';

describe('utcDate', () => {
    it('timezone', () => {
        const date = new UtcDate(2023, 1, 1, 12, 0, 'Europe/Berlin');
        expect(date).to.be.deep.equal(new UtcDate(2023, 1, 1, 12, 0));
    });

    it('from date', () => {
        expect(UtcDate.fromIsoDate(UtcDate.now.toIsoDate).day).to.be.equal(new Date().getDate());
        const date = UtcDate.fromDate(new Date('2023-02-07T12:34:56+01:00'));
        expect(date).to.be.deep.equal(new UtcDate(2023, 2, 7, 11, 34));
    });

    it('encode', () => {
        expect(new UtcDate(2024, 4, 3, 9, 3).encoded).to.be.equal('2024-04-03-09-03');
        expect(new UtcDate(2024, 11, 23, 19, 21).encoded).to.be.equal('2024-11-23-19-21');
    });

    it('encode decode', () => {
        const date = UtcDate.fromDate(new Date('2023-02-07T12:34:56+01:00'));
        const { encoded } = date;
        expect(encoded).to.be.equal('2023-02-07-11-34');
        expect(UtcDate.decode(encoded)).to.be.deep.equal(date);
        expect(UtcDate.decode('')).to.be.deep.equal(new UtcDate(0, 0, 0, 0, 0));
    });

    it('setted', () => {
        const date = UtcDate.fromDate(new Date('2023-02-07T12:34:56+01:00'));
        let newDate = date.setted({ year: 2022, month: 5, day: 1 });
        expect(newDate).to.be.deep.equal(new UtcDate(2022, 5, 1, 11, 34));
        newDate = date.setted({ hour: 0, minute: 0 });
        expect(newDate).to.be.deep.equal(new UtcDate(2023, 2, 7, 0, 0));
        newDate = date.setted({ month: 1, day: 40, minute: 65 });
        expect(newDate).to.be.deep.equal(new UtcDate(2023, 2, 9, 12, 5));
    });

    it('advanced', () => {
        const date = UtcDate.fromDate(new Date('2023-02-07T12:34:56+01:00'));
        let newDate = date.advanced({ year: 1, month: 1, day: 1 });
        expect(newDate).to.be.deep.equal(new UtcDate(2024, 3, 8, 11, 34));
        newDate = date.advanced({ hour: 4, minute: 2 });
        expect(newDate).to.be.deep.equal(new UtcDate(2023, 2, 7, 15, 36));
        newDate = date.advanced({ month: 1, day: 30, minute: 30 });
        expect(newDate).to.be.deep.equal(new UtcDate(2023, 4, 6, 12, 4));
    });

    it('compare', () => {
        const date1 = UtcDate.fromDate(new Date('2024-02-07T12:34:56+01:00'));
        const date2 = UtcDate.fromDate(new Date('2023-02-08T12:34:56+01:00'));
        const date3 = UtcDate.fromDate(new Date('2023-02-07T12:35:56+01:00'));
        const date4 = UtcDate.fromDate(new Date('2023-02-07T12:34:56+01:00'));
        const date5 = UtcDate.fromDate(new Date('2023-02-07T13:34:56+01:00'));
        const date6 = UtcDate.fromDate(new Date('2023-03-07T13:34:56+01:00'));
        expect(date1.compare(date2)).to.be.equal('greater');
        expect(date1.compare(date3)).to.be.equal('greater');
        expect(date1.compare(date4)).to.be.equal('greater');
        expect(date2.compare(date3)).to.be.equal('greater');
        expect(date2.compare(date4)).to.be.equal('greater');
        expect(date3.compare(date4)).to.be.equal('greater');
        expect(date1.compare(date1)).to.be.equal('equal');
        expect(date2.compare(date1)).to.be.equal('less');
        expect(date3.compare(date1)).to.be.equal('less');
        expect(date4.compare(date1)).to.be.equal('less');
        expect(date3.compare(date2)).to.be.equal('less');
        expect(date4.compare(date2)).to.be.equal('less');
        expect(date4.compare(date3)).to.be.equal('less');
        expect(date4.compare(date5)).to.be.equal('less');
        expect(date5.compare(date4)).to.be.equal('greater');
        expect(date5.compare(date6)).to.be.equal('less');
        expect(date6.compare(date5)).to.be.equal('greater');
    });
});
