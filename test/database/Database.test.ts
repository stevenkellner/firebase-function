import * as admin from 'firebase-admin';
import * as dotenv from 'dotenv';
import { DatabaseReference, type IDatabaseReference, type DatabaseValue, type DatabaseScheme } from '../../src';
import { IdentityCrypter } from '../crypter/IdentitiyCrypter';
import { expect } from '../../testSrc';

export type Scheme = DatabaseScheme<{
    v1: DatabaseValue<boolean, false>;
    v2: DatabaseValue<string, false>;
    v3: DatabaseValue<number, false>;
    v4: DatabaseValue<(boolean | string | number)[], false>;
    v5: DatabaseValue<{
        s1: boolean;
        s2: string;
        s3: number;
    }, false>;
    c1: DatabaseValue<boolean, true>;
    c2: DatabaseValue<string, true>;
    c3: DatabaseValue<number, true>;
    c4: DatabaseValue<(boolean | string | number)[], true>;
    c5: DatabaseValue<{
        s1: boolean;
        s2: string;
        s3: number;
    }, true>;
    r1: {
        v1: DatabaseValue<number, false>;
        c1: DatabaseValue<string, true>;
        r1: Record<string, DatabaseValue<boolean, false>>;
    };
}>;

describe('Database', () => {

    // eslint-disable-next-line @typescript-eslint/init-declarations
    let reference!: IDatabaseReference<Scheme>;

    before(() => {
        dotenv.config({ path: 'test/.env.test' });
        admin.initializeApp({
            credential: admin.credential.cert({
                projectId: process.env.FIREBASE_PROJECT_ID,
                privateKey: process.env.FIREBASE_PRIVATE_KEY,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL
            }),
            databaseURL: process.env.FIREBASE_DATABASE_URL
        });
        reference = new DatabaseReference(admin.app().database().ref(), new IdentityCrypter());
    });

    beforeEach(async () => {
        await admin.app().database().ref().set({
            v1: false,
            v2: 'asdf',
            v3: -1.5,
            v4: [true, '', 0, 1],
            v5: {
                s1: false,
                s2: 'vaadf',
                s3: 19
            },
            c1: 'ZmFsc2ULCwsLCwsLCwsLCw==',
            c2: 'ImFzZGYiCgoKCgoKCgoKCg==',
            c3: 'LTEuNQwMDAwMDAwMDAwMDA==',
            c4: 'W3RydWUsIiIsMCwxXQMDAw==',
            c5: 'eyJzMSI6ZmFsc2UsInMyIjoidmFhZGYiLCJzMyI6MTl9Dw8PDw8PDw8PDw8PDw8P',
            r1: {
                v1: 234,
                c1: 'Im9pamtuIgkJCQkJCQkJCQ==',
                r1: {
                    b1: true,
                    b2: true,
                    b3: false
                }
            }
        });
    });

    afterEach(async () => {
        await admin.app().database().ref().remove();
    });

    after(async () => {
        await admin.app().delete();
    });

    it('get value', async () => {
        expect((await reference.child('v1').snapshot()).value).to.be.equal(false);
        expect((await reference.child('v2').snapshot()).value).to.be.equal('asdf');
        expect((await reference.child('v3').snapshot()).value).to.be.equal(-1.5);
        expect((await reference.child('v4').snapshot()).value).to.be.deep.equal([true, '', 0, 1]);
        expect((await reference.child('v5').snapshot()).value).to.be.deep.equal({
            s1: false,
            s2: 'vaadf',
            s3: 19
        });
        expect((await reference.child('c1').snapshot()).uncryptedValue).to.be.equal(false);
        expect((await reference.child('c2').snapshot()).uncryptedValue).to.be.equal('asdf');
        expect((await reference.child('c3').snapshot()).uncryptedValue).to.be.equal(-1.5);
        expect((await reference.child('c4').snapshot()).uncryptedValue).to.be.deep.equal([true, '', 0, 1]);
        expect((await reference.child('c5').snapshot()).uncryptedValue).to.be.deep.equal({
            s1: false,
            s2: 'vaadf',
            s3: 19
        });
        expect((await reference.child('r1').snapshot()).child('v1').value).to.be.equal(234);
        expect((await reference.child('r1').snapshot()).child('c1').uncryptedValue).to.be.equal('oijkn');
        expect((await reference.child('r1').snapshot()).child('r1').child('b1').value).to.be.equal(true);
        expect((await reference.child('r1').snapshot()).child('r1').child('b2').value).to.be.equal(true);
        expect((await reference.child('r1').snapshot()).child('r1').child('b3').value).to.be.equal(false);
    });

    it('set value', async () => {
        await reference.child('v1').set(true);
        await reference.child('v2').set('djbjds');
        await reference.child('v3').set(45);
        await reference.child('v4').set(['adf', false]);
        await reference.child('v5').set({
            s1: true,
            s2: '87bw',
            s3: -5
        });
        await reference.child('c1').setCrypted(true);
        await reference.child('c2').setCrypted('djbjds');
        await reference.child('c3').setCrypted(45);
        await reference.child('c4').setCrypted(['adf', false]);
        await reference.child('c5').setCrypted({
            s1: true,
            s2: '87bw',
            s3: -5
        });
        await reference.child('r1').child('v1').set(76);
        await reference.child('r1').child('c1').setCrypted('bzr');
        await reference.child('r1').child('r1').child('b1').set(false);
        await reference.child('r1').child('r1').child('b3').set(true);
        await reference.child('r1').child('r1').child('b4').set(false);
        expect((await admin.app().database().ref().once('value')).val()).to.be.deep.equal({
            v1: true,
            v2: 'djbjds',
            v3: 45,
            v4: ['adf', false],
            v5: {
                s1: true,
                s2: '87bw',
                s3: -5
            },
            c1: 'dHJ1ZQwMDAwMDAwMDAwMDA==',
            c2: 'ImRqYmpkcyIICAgICAgICA==',
            c3: 'NDUODg4ODg4ODg4ODg4ODg==',
            c4: 'WyJhZGYiLGZhbHNlXQMDAw==',
            c5: 'eyJzMSI6dHJ1ZSwiczIiOiI4N2J3IiwiczMiOi01fQE=',
            r1: {
                v1: 76,
                c1: 'ImJ6ciILCwsLCwsLCwsLCw==',
                r1: {
                    b1: false,
                    b2: true,
                    b3: true,
                    b4: false
                }
            }
        });
    });

    it('remove', async () => {
        await reference.child('r1').child('r1').child('b1').remove();
        expect((await admin.app().database().ref().child('r1').child('r1').once('value')).val()).to.be.deep.equal({
            b2: true,
            b3: false
        });
    });

    it('snapshot properties', async () => {
        expect((await reference.child('r1').child('r1').snapshot()).hasChildren).to.be.equal(true);
        expect((await reference.child('r1').child('r1').snapshot()).child('b4').hasChildren).to.be.equal(false);
        expect((await reference.child('r1').child('r1').snapshot()).numberChildren).to.be.equal(3);
        expect((await reference.child('r1').child('r1').snapshot()).key).to.be.equal('r1');
        expect((await reference.child('r1').child('r1').snapshot()).exists).to.be.equal(true);
        expect((await reference.child('r1').child('r1').snapshot()).child('b4').exists).to.be.equal(false);
    });

    it('transform snapshot', async () => {
        expect((await reference.child('r1').child('r1').snapshot()).map(snapshot => snapshot.value ? 1 : 0)).to.be.deep.equal([1, 1, 0]);
        expect((await reference.child('r1').child('r1').snapshot()).flatMap(snapshot => snapshot.value ? [1, 1] : [0])).to.be.deep.equal([1, 1, 1, 1, 0]);
        expect((await reference.child('r1').child('r1').snapshot()).compactMap(snapshot => snapshot.value ? 1 : null)).to.be.deep.equal([1, 1]);
        expect((await reference.child('r1').child('r1').snapshot()).compactMap(snapshot => snapshot.value ? 1 : undefined)).to.be.deep.equal([1, 1]);
        expect((await reference.child('r1').child('r1').snapshot()).reduce(0, (result, snapshot) => result + (snapshot.value ? 1 : 0))).to.be.equal(2);
        expect((await reference.child('r1').child('r1').snapshot()).reduceInto({ value: 0 }, (result, snapshot) => {
            // eslint-disable-next-line no-param-reassign
            result.value += snapshot.value ? 1 : 0;
        })).to.be.deep.equal({ value: 2 });
    });
});
