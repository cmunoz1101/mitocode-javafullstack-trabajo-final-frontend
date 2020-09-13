import { Component, OnInit } from '@angular/core';
import { Paciente } from '../../../../_model/paciente';
import { PacienteService } from '../../../../_service/paciente.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-paciente-dialogo',
  templateUrl: './paciente-dialogo.component.html',
  styleUrls: ['./paciente-dialogo.component.css']
})
export class PacienteDialogoComponent implements OnInit {

  form: FormGroup;
  pacienteResponse: Paciente = new Paciente();

  constructor(
    private dialogRef: MatDialogRef<PacienteDialogoComponent>,
    private pacienteService: PacienteService
  ) { }

  ngOnInit(): void {
    this.form = new FormGroup({
      id: new FormControl(0),
      nombres: new FormControl('', [Validators.required, Validators.minLength(3)]),
      apellidos: new FormControl('', Validators.required),
      dni: new FormControl(''),
      telefono: new FormControl(''),
      direccion: new FormControl('')
    });

  }

  get f() { return this.form.controls; }

  operar() {

    if (this.form.invalid) { return; }

    const paciente = new Paciente();
    paciente.idPaciente = this.form.value.id;
    paciente.nombres = this.form.value.nombres;
    paciente.apellidos = this.form.value.apellidos;
    paciente.dni = this.form.value.dni;
    paciente.telefono = this.form.value.telefono;
    paciente.direccion = this.form.value.direccion;

    this.pacienteService.registrar(paciente).pipe(switchMap((data: Paciente) => {
      this.pacienteResponse.idPaciente = data.idPaciente;
      this.pacienteResponse.nombres = data.nombres;
      this.pacienteResponse.apellidos = data.apellidos;
      this.pacienteResponse.dni = data.dni;
      this.pacienteResponse.direccion = data.direccion;
      this.pacienteResponse.telefono = data.telefono;
      return this.pacienteService.listar();
    })).subscribe(data => {
      this.pacienteService.pacienteCambio.next(data);
      this.pacienteService.mensajeCambio.next('Se registró');
    });
    this.dialogRef.close({
      data: this.pacienteResponse
    });

  }

  cancelar() {
    this.dialogRef.close();
  }

}
