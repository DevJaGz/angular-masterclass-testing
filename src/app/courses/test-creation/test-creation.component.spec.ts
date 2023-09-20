import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TestCreationComponent } from './test-creation.component';
import { DebugElement } from '@angular/core';

describe('TestCreationComponent', () => {
  let fixture: ComponentFixture<TestCreationComponent>;
  let component: TestCreationComponent;
  let el: DebugElement;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TestCreationComponent]
    });
    fixture = TestBed.createComponent(TestCreationComponent);
    component = fixture.componentInstance;
    el = fixture.debugElement;
  });

  it('should create the TestCreationComponent', () => {
    expect(component).toBeTruthy();
  });

});
