import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { switchMap, take, map } from 'rxjs/operators';
import { AngularFireAuth } from '@angular/fire/auth';
import { DbService } from './db.service';
import { Router } from '@angular/router';
import { auth } from 'firebase';

import { GooglePlus } from '@ionic-native/google-plus/ngx';
import { Platform } from '@ionic/angular';
import { LoadingController } from '@ionic/angular';
import { Storage } from '@ionic/storage';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  user$: Observable<any>;

  constructor(
    private afAuth: AngularFireAuth,
    private db: DbService,
    private router: Router,
    // private gplus: GooglePlus,
    private platform: Platform,
    // private loadingController: LoadingController,
    private storage: Storage,
    private loadingController: LoadingController,
    private gplus: GooglePlus
  ) {
    this.user$ = this.afAuth.authState.pipe(
      switchMap(user => (user ? db.doc$(`users/${user.uid}`) : of(null)))
    );

    if (platform.is('pwa')) {
      this.handleRedirect();
    }

  }

  async anonymousLogin() {
    const credential = await this.afAuth.auth.signInAnonymously();
    return await this.updateUserData(credential.user);
  }

  async signOut() {
    await this.afAuth.auth.signOut();
    return this.router.navigate(['/']);
  }

  private updateUserData({ uid, email, displayName, photoURL, isAnonymous }) {
    const path = `users/${uid}`;
    const data = {
      uid,
      email,
      displayName,
      photoURL,
      isAnonymous
    };

    return this.db.updateAt(path, data);
  }

  setRedirect(val) {
    this.storage.set('authRedirect', val);
  }

  async isRedirect() {
    return await this.storage.get('authRedirect');
  }

  async googleLogin() {
    try {
      let user;

      if (this.platform.is('cordova')) {
        user = await this.nativeGoogleLogin();
        console.warn('Platform is cordova');
      } else {
        console.warn('Platform is NOT cordova');
        await this.setRedirect(true);
        const provider = new auth.GoogleAuthProvider();

        // user = await this.afAuth.auth.signInWithPopup(provider);
        user = await this.afAuth.auth.signInWithRedirect(provider);
      }
      return await this.updateUserData(user);
    } catch (err) {
      console.log(err);
    }
  }

  private async handleRedirect() {
    if ((await this.isRedirect()) !== true) {
      return null;
    }

    const loading = await this.loadingController.create();
    await loading.present();

    const result = await this.afAuth.auth.getRedirectResult();

    if (result.user) {
      await this.updateUserData(result.user);
    }

    await loading.dismiss();
    await this.setRedirect('fasle');

    return result;

  }

  async nativeGoogleLogin(): Promise<any> {
    const gplusUser = await this.gplus.login({
      webClientId:
        '579847091834-6nq8g3i2h4bqtt4v7dvke81vko2qfhou.apps.googleusercontent.com',
      offline: true,
      scopes: 'profile email'
    });
    return await this.afAuth.auth.signInWithCredential(
      auth.GoogleAuthProvider.credential(gplusUser.idToken)
    );
  }


  uid() {
    return this.user$.pipe(
      take(1),
      map(u => u && u.uid)
    ).toPromise();
  }



} //end auth.service.ts
