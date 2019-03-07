import { Component, OnInit } from '@angular/core';
import { DbService } from '../services/db.service';
import { AuthService } from '../services/auth.service';
import { ModalController } from '@ionic/angular';

import { BehaviorSubject } from 'rxjs';
import { switchMap, map, shareReplay } from 'rxjs/operators';
import { TodoFormComponent } from './todo-form/todo-form.component';

@Component({
  selector: 'app-todo',
  templateUrl: './todo.page.html',
  styleUrls: ['./todo.page.scss'],
})
export class TodoPage implements OnInit {

  todos;
  filtered;

  filter = new BehaviorSubject(null);

  constructor(
    public db: DbService,
    public auth: AuthService,
    public modal: ModalController
  ) { }

  async ngOnInit() {
    const uid = await this.auth.uid();

    this.todos = this.db.collection$('todos', ref =>
      ref
        .where('uid', '==', uid)
        .orderBy('createdAt', 'desc')
        .limit(25)
    );

    //See Jeff Delaney's Custom RxJS operators on ways to 
    //make this more readable
    this.filtered = this.filter.pipe(
      switchMap(filter => {
        return this.todos.pipe(
          map(arr =>
            (arr as any[]).filter(
              obj => (status ? obj.status === status : true)
            )
          )
        )
      }
      )

    );

    // this.todos = this.auth.user$.pipe(
    //   switchMap(user =>
    //     this.db.collection$('todos', ref =>
    //       ref
    //         .where('uid', '==', user.uid)
    //         .orderBy('createdAt', 'desc')
    //         .limit(25)
    //     )
    //   ),
    //   shareReplay(1)
    // );
  }

  trackById(idx, todo) {
    return todo.id;
  }

  deleteTodo(todo) {
    this.db.delete(`todos/${todo.id}`);
  }

  toggleStatus(todo) {
    const status = todo.status === 'complete' ? 'pending' : 'complete';
    this.db.updateAt(`todos/${todo.id}`, { status });
  }

  updateFilter(val) {
    //filter todos where status === eventValue
    console.warn('updating filter: ' + val);
    this.filter.next(val);
  }


}
