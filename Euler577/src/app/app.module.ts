import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';


import { AppComponent } from './app.component';
import { WorkspaceViewComponent } from './workspace-view/workspace-view.component';
import { FormsModule } from '@angular/forms';
import { SolutionGeneratorComponent } from './solution-generator/solution-generator.component';

@NgModule({
  declarations: [
    AppComponent,
    WorkspaceViewComponent,
    SolutionGeneratorComponent
  ],
  imports: [
    BrowserModule,
    FormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
