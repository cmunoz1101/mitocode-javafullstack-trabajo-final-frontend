import { Component, OnInit, Inject } from '@angular/core';
import { Signo } from '../../../_model/signo';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { SignoService } from '../../../_service/signo.service';
import { ActivatedRoute, Router, Params } from '@angular/router';
import { switchMap, map } from 'rxjs/operators';
import { PacienteService } from '../../../_service/paciente.service';
import { Paciente } from '../../../_model/paciente';
import { Observable } from 'rxjs';
import { PacienteDialogoComponent } from './paciente-dialogo/paciente-dialogo.component';
import { MatDialog } from '@angular/material/dialog';
import * as moment from 'moment';

@Component({
  selector: 'app-signo-edicion',
  templateUrl: './signo-edicion.component.html',
  styleUrls: ['./signo-edicion.component.css']
})
export class SignoEdicionComponent implements OnInit {

  id: number;
  signo: Signo;
  form: FormGroup;
  edicion = false;
  myControlPaciente: FormControl = new FormControl();
  pacientes: Paciente[];
  pacientesFiltrados$: Observable<Paciente[]>;
  pacienteSeleccionado: Paciente;
  maxFecha: Date = new Date();
  fechaSeleccionada: Date = new Date();

  constructor(
    private signoService: SignoService,
    private route: ActivatedRoute,
    private router: Router,
    private pacienteService: PacienteService,
    private dialog: MatDialog) {
  }

  ngOnInit() {

    this.signo = new Signo();

    this.form = new FormGroup({
      id: new FormControl(0),
      paciente: this.myControlPaciente,
      fecha: new FormControl(new Date()),
      temperatura: new FormControl(''),
      pulso: new FormControl(''),
      ritmoRespiratorio: new FormControl('')
    });

    this.listarPacientes();

    this.route.params.subscribe((params: Params) => {
      this.id = params.id;
      this.edicion = params.id != null;
      this.initForm();
    });

    this.pacientesFiltrados$ = this.myControlPaciente.valueChanges.pipe(map(val => this.filtrarPacientes(val)));

  }

  listarPacientes(): void {
    this.pacienteService.listar().subscribe(data => {
      this.pacientes = data;
    });
  }

  filtrarPacientes(val: any) {
    if (val != null && val.idPaciente > 0) {
      if (`${val}`.length > 0) {
        return this.pacientes.filter(elem =>
          elem.nombres.toLowerCase().includes(val.nombres.toLowerCase()) ||
          elem.apellidos.toLowerCase().includes(val.apellidos.toLowerCase()) ||
          elem.dni.toLowerCase().includes(val.dni.toLowerCase())
        );
      }
    }
    if (val.length > 0) {
      return this.pacientes.filter(elem =>
        elem.nombres.toLowerCase().includes(val.toLowerCase()) ||
        elem.apellidos.toLowerCase().includes(val.toLowerCase()) ||
        elem.dni.toLowerCase().includes(val.toLowerCase())
      );
    }
  }

  mostrarPaciente(val: Paciente) {
    return val ? `${val.nombres} ${val.apellidos}` : val;
  }

  seleccionarPaciente(e: any) {
    this.pacienteSeleccionado = e.option.value;
  }

  initForm() {
    if (this.edicion) {
      this.signoService.listarPorId(this.id).subscribe(data => {
        const id = data.idSigno;
        this.pacienteSeleccionado = data.paciente;
        const fecha = data.fecha;
        const temperatura = data.temperatura;
        const pulso = data.pulso;
        const ritmoRespiratorio = data.ritmoRespiratorio;
        this.form = new FormGroup({
          id: new FormControl(id),
          paciente: new FormControl({ value: this.pacienteSeleccionado, disabled: true }, Validators.required),
          fecha: new FormControl(moment(fecha).format('YYYY-MM-DDTHH:mm:ss')),
          temperatura: new FormControl(temperatura),
          pulso: new FormControl(pulso),
          ritmoRespiratorio: new FormControl(ritmoRespiratorio)
        });
      });
    }
  }

  operar() {
    this.signo.idSigno = this.form.value.id;
    this.signo.paciente = this.pacienteSeleccionado;
    this.signo.fecha = this.form.value.fecha;
    this.signo.temperatura = this.form.value.temperatura;
    this.signo.pulso = this.form.value.pulso;
    this.signo.ritmoRespiratorio = this.form.value.ritmoRespiratorio;

    if (this.signo != null && this.signo.idSigno > 0) {

      this.signoService.modificar(this.signo).pipe(switchMap(() => {
        return this.signoService.listar();
      })).subscribe(data => {
        this.signoService.setSignoCambio(data);
        this.signoService.setMensajeCambio('Se modificó');
      });

    } else {

      this.signoService.registrar(this.signo).pipe(switchMap(() => {
        return this.signoService.listar();
      })).subscribe(data => {
        this.signoService.setSignoCambio(data);
        this.signoService.setMensajeCambio('Se registró');
      });

    }

    this.router.navigate(['signo']);
  }

  pacienteNuevo() {
    const dialogRef = this.dialog.open(PacienteDialogoComponent, {
      width: '400px'
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result !== undefined) {
        this.pacienteSeleccionado = result.data;
        this.form = new FormGroup({
          id: new FormControl(0),
          paciente: new FormControl(this.pacienteSeleccionado),
          fecha: new FormControl(this.form.value.fecha),
          temperatura: new FormControl(this.form.value.temperatura),
          pulso: new FormControl(this.form.value.pulso),
          ritmoRespiratorio: new FormControl(this.form.value.ritmoRespiratorio)
        });
      }
    });
  }

  cambieFecha(e: any) {
    console.log(e);
  }

}
