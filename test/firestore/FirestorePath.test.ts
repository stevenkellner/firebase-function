import { FirestorePath } from '../../src';
import { expect } from '../../src/testSrc';

describe('FirestorePath', () => {

    // eslint-disable-next-line @typescript-eslint/init-declarations
    let path: FirestorePath;

    beforeEach(() => {
        path = new FirestorePath('users', 'john');
    });

    it('should append components to the path', () => {
        path.append('posts', '123');
        expect(path.fullPath).to.be.equal('users/john/posts/123');
    });

    it('invalid component should throw an error', () => {
        expect(() => {
            path.append('posts/123');
        }).to.throw('Invalid component: posts/123');
    });

    it('should return a new path with appended components', () => {
        const newPath = path.appending('posts', '123');
        expect(newPath.fullPath).to.be.equal('users/john/posts/123');
        expect(path.fullPath).to.be.equal('users/john');
    });

    it('should check if the path is empty', () => {
        expect(path.isEmpty).to.be.equal(false);
        const emptyPath = new FirestorePath();
        expect(emptyPath.isEmpty).to.be.equal(true);
    });

    it('should return the parent path', () => {
        expect(path.parentPath.fullPath).to.be.equal('users');
        expect(path.fullPath).to.be.equal('users/john');
    });

    it('parent path of root path should throw an error', () => {
        expect(() => {
            new FirestorePath().parentPath;
        }).to.throw('Root path has no parent');
    });

    it('should return the last component of the path', () => {
        expect(path.lastComponent).to.be.equal('john');
    });

    it('should return the full path', () => {
        expect(path.fullPath).to.be.equal('users/john');
    });
});
