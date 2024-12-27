import { expect } from '@assertive-ts/core';
import { FirestorePath } from '../../src/admin';

describe('FirestorePath', () => {
    let path: FirestorePath;

    beforeEach(() => {
        path = new FirestorePath('users', 'john');
    });

    it('should append components to the path', () => {
        path.append('posts', '123');
        expect(path.fullPath).toBeEqual('users/john/posts/123');
    });

    it('invalid component should throw an error', () => {
        expect(() => path.append('posts/123'))
            .toThrowError(Error)
            .toHaveMessage('Invalid component: posts/123');
    });

    it('should return a new path with appended components', () => {
        const newPath = path.appending('posts', '123');
        expect(newPath.fullPath).toBeEqual('users/john/posts/123');
        expect(path.fullPath).toBeEqual('users/john');
    });

    it('should check if the path is empty', () => {
        expect(path.isEmpty).toBeEqual(false);
        const emptyPath = new FirestorePath();
        expect(emptyPath.isEmpty).toBeEqual(true);
    });

    it('should return the parent path', () => {
        expect(path.parentPath.fullPath).toBeEqual('users');
        expect(path.fullPath).toBeEqual('users/john');
    });

    it('parent path of root path should throw an error', () => {
        expect(() => new FirestorePath().parentPath)
            .toThrowError(Error)
            .toHaveMessage('Root path has no parent');
    });

    it('should return the last component of the path', () => {
        expect(path.lastComponent).toBeEqual('john');
    });

    it('should return the full path', () => {
        expect(path.fullPath).toBeEqual('users/john');
    });
});
