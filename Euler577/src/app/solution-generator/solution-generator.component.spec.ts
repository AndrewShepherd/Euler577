import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SolutionGeneratorComponent } from './solution-generator.component';

describe('SolutionGeneratorComponent', () => {
  let component: SolutionGeneratorComponent;
  let fixture: ComponentFixture<SolutionGeneratorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SolutionGeneratorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SolutionGeneratorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
