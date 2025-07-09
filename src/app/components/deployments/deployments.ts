import { Component } from '@angular/core';

import { AnalyzerService } from '../../services/analyzer.service';
import { ConfigService } from '../../services/config.service';

import { MatSnackBar } from '@angular/material/snack-bar';


@Component({
  selector: 'app-deployments',
  standalone: false,
  templateUrl: './deployments.html',
  styleUrl: './deployments.css',
})
export class Deployments {

  geoDbKey: string = '';
  delayValue: number = 1000;
  analyzerRunning: boolean = false;

  // Loading states
  isLoadingSetup: boolean = false;
  isLoadingStart: boolean = false;
  isLoadingDeploy: boolean = false;

  // Deployment form properties
  name_input: string = '';
  IP_input: string = '';
  user_input: string = '';
  passw_input: string = '';

  // PLC containers
  Containers_input: any[] = [];
  add_container_name_input: string = '';
  add_container_ip_input: string = '';

  // Deployments
  deployments: any = { RemoteDeployments: [] };
  selectedDeployment: any = null;

  
  constructor(
    private analyzerS: AnalyzerService,
    private _snackBar: MatSnackBar,
    private configS: ConfigService
  ) {
    // Initialize with sample data
    this.initializeSampleData();
  }


  initDeployments(){
    //ToDo
  }

  // Configuration methods
  setKeyConfig() {
    this.configS.setKeyConfig(this.geoDbKey).subscribe((res: any) => {
      console.log(res);
      if (res['message'] == 'MaxMind_GeoDB_Key changed successfully') {
        this.initDeployments();
      }
    });
  }

  setDelayConfig() {
    this.configS.setDelayConfig(this.delayValue).subscribe({
      next: (res: any) => {
        if (res['message'] == 'Delay changed successfully') {
          this._snackBar.open('Delay settato correttamente', 'Chiudi', {
            duration: 2000,
          });

          this.initDeployments();
        }
      },
      error: (error: any) => {
        this._snackBar.open('Errore nel caricamento dei dati!', 'Chiudi', {
          duration: 2000,
        });
      }
    });
  }

  // Analyzer methods
  forceOpenSearchSetup() {
    this.isLoadingSetup = true;

    this.analyzerS.forceOpenSearchSetup().subscribe({
      next: (res: any) => {
        console.log(res);
        if (res == 'Opensearch configured') {
          this._snackBar.open(
            'OpenSearch setup configured successfully!',
            'Chiudi',
            {
              duration: 5000,
            }
          );
        }
      },
      error: () => {
        this._snackBar.open(
          'Errore nella configurazione di OpenSearch',
          'Chiudi',
          {
            duration: 5000,
          }
        );
        this.isLoadingSetup = false;
      },
      complete: () => {
        this.isLoadingSetup = false;
      },
    });
  }

  startAnalyzer() {
    this.isLoadingStart = true;
    this.analyzerS.start().subscribe({
      next: (res: any) => {
        console.log(res);
        this._snackBar.open('Analyzer avviato con successo!', 'Chiudi', {
          duration: 3000,
        });
        this.updateAnalyzerStatus();
      },
      error: () => {
        this._snackBar.open("Errore nell'avvio dell'analyzer", 'Chiudi', {
          duration: 5000,
        });
        this.isLoadingStart = false;
        this.updateAnalyzerStatus();
      },
      complete: () => {
        this.isLoadingStart = false;
      },
    });
  }

  stopAnalyzer() {
    this.analyzerS.stop().subscribe({
      next: (res: any) => {
        this._snackBar.open('Analyzer stoppato con successo!', 'Chiudi', {
          duration: 3000,
        });
        this.updateAnalyzerStatus();
      },
      error: () => {
        this.updateAnalyzerStatus();
      }
    });
  }


  updateAnalyzerStatus(): void {
    this.analyzerS.getStatus().subscribe({
      next: (res: any) => {
        // Supponiamo che la risposta sia { running: true/false }
        this.analyzerRunning = !!res.running;
      },
      error: () => {
        this.analyzerRunning = false;
      }
    });
  }

  // PLC methods
  addPlcIp() {
    if (this.add_container_name_input && this.add_container_ip_input) {
      this.Containers_input.push({
        name: this.add_container_name_input,
        IP: this.add_container_ip_input,
        status: 'Connected',
      });
      this.add_container_name_input = '';
      this.add_container_ip_input = '';
    }
  }

  removePlcIp(index: number) {
    this.Containers_input.splice(index, 1);
  }

  // Form validation
  isFormValid(): boolean {
    return !!(
      this.name_input &&
      this.IP_input &&
      this.user_input &&
      this.passw_input
    );
  }

  // Deployment methods
  addDeployment() {
    if (this.isFormValid()) {
      this.isLoadingDeploy = true;

      setTimeout(() => {
        const newDeployment = {
          name: this.name_input,
          IP: this.IP_input,
          username: this.user_input,
          password: this.passw_input,
          Containers: JSON.parse(JSON.stringify(this.Containers_input)), // Deep copy
          status: 'Online',
          createdAt: new Date(),
        };

        this.deployments.RemoteDeployments.push(newDeployment);
        this.resetForm();
        this.isLoadingDeploy = false;
        console.log('Deployment added:', newDeployment);
      }, 2000);
    }
  }

  selectDeployment(deployment: any) {
    this.selectedDeployment =
      this.selectedDeployment === deployment ? null : deployment;
  }

  editDeployment(deployment: any) {
    console.log('Editing deployment:', deployment);
    // Implement edit logic
  }

  removeDeployment(ip: string) {
    const index = this.deployments.RemoteDeployments.findIndex(
      (d: any) => d.IP === ip
    );
    if (index > -1) {
      this.deployments.RemoteDeployments.splice(index, 1);
      if (this.selectedDeployment?.IP === ip) {
        this.selectedDeployment = null;
      }
    }
  }

  // Utility methods
  getStatusColor(status: string): string {
    switch (status) {
      case 'Online':
        return '#4caf50';
      case 'Offline':
        return '#f44336';
      case 'Warning':
        return '#ff9800';
      default:
        return '#2196f3';
    }
  }

  getDeviceStatusColor(status: string): string {
    switch (status) {
      case 'Connected':
        return '#4caf50';
      case 'Disconnected':
        return '#f44336';
      case 'Error':
        return '#f44336';
      default:
        return '#2196f3';
    }
  }

  resetForm() {
    this.name_input = '';
    this.IP_input = '';
    this.user_input = '';
    this.passw_input = '';
    this.Containers_input = [];
    this.add_container_name_input = '';
    this.add_container_ip_input = '';
  }

  initializeSampleData() {
    this.deployments.RemoteDeployments = [
      {
        name: 'Production Line 1',
        IP: '192.168.1.100',
        username: 'admin',
        Containers: [
          { name: 'PLC-001', IP: '192.168.1.10', status: 'Connected' },
          { name: 'PLC-002', IP: '192.168.1.11', status: 'Connected' },
          { name: 'PLC-003', IP: '192.168.1.12', status: 'Warning' },
        ],
        status: 'Online',
      },
      {
        name: 'Quality Control',
        IP: '192.168.1.101',
        username: 'qc_admin',
        Containers: [
          { name: 'QC-PLC-001', IP: '192.168.1.20', status: 'Connected' },
          { name: 'QC-PLC-002', IP: '192.168.1.21', status: 'Disconnected' },
        ],
        status: 'Warning',
      },
    ];
  }
}
