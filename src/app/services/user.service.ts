import { AngularFirestore, AngularFirestoreCollection } from 'angularfire2/firestore';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IUser } from '../models/user';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  userCollection: AngularFirestoreCollection<IUser>;
  user: Observable<IUser[]>;

  constructor(public fs: AngularFirestore) {
    this.userCollection = fs.collection<IUser>('users');
    this.user = this.userCollection.valueChanges();
  }

  getUserDetails() {
    return this.user;
  }
}
