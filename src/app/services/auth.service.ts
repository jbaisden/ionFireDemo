import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { switchMap, take, map } from 'rxjs/operators';
import { AngularFireAuth } from '@angular/fire/auth';
import { DbService } from './db.service';
import { Router } from '@angular/router';
import { auth } from 'firebase';
import { Platform } from '@ionic/angular';
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
    private storage: Storage
  ) {
    this.user$ = this.afAuth.authState.pipe(
      switchMap(user => (user ? db.doc$(`users/${user.uid}`) : of(null)))
    );
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
        // user = await this.nativeGoogleLogin();
      } else {
        await this.setRedirect(true);
        const provider = new auth.GoogleAuthProvider();
        user = await this.afAuth.auth.signInWithRedirect(provider);
      }

      return await this.updateUserData(user);
    } catch (err) {
      console.log(err);
    }
  }

  // async nativeGoogleLogin(): Promise<any> {
  //   const gplusUser = await this.gplus.login({
  //   webClientId:
  //   '1085404550227-h1iabv9megngs4eleo7kd5khoo4fkn98.apps.googleusercontent.com',
  //   offline: true,
  //   scopes: 'profile email'
  //   });
  //   return await this.afAuth.auth.signInWithCredential(
  //   auth.GoogleAuthProvider.credential(gplusUser.idToken)
  //   );
  //   }


}
