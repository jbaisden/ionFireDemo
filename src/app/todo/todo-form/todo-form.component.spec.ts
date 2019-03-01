import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TodoFormPage } from './todo-form.page';

describe('TodoFormPage', () => {
  let component: TodoFormPage;
  let fixture: ComponentFixture<TodoFormPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TodoFormPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TodoFormPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
