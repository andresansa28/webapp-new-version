import { Component, OnInit } from '@angular/core';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';


interface Tenant {
  id: string;
  name: string;
  description: string;
}

interface Index {
  id: string;
  name: string;
  documents: number;
  size: string;
  created: Date;
  status: string;
}

interface Document {
  id: string;
  timestamp: Date;
  type: string;
  status: string;
  size: string;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css'],
  standalone: false // Se usi moduli classici
  // oppure standalone: true e imports: [BaseChartDirective] se usi standalone components
})
export class Dashboard implements OnInit {
  
  // Data Properties
  tenants: Tenant[] = [];
  indices: Index[] = [];
  documents: Document[] = [];
  filteredDocuments: Document[] = [];
  
  // State Properties
  selectedTenant: string = '';
  activeTabIndex: number = -1;
  isLoading: boolean = false;
  searchTerm: string = '';
  
  // Stats Properties
  totalIndices: number = 0;
  totalDocuments: number = 0;
  totalSize: string = '';
  lastUpdateTime: string = '';
  
  // Chart Data
  timelineChartData: ChartData<'line'> = {
    labels: [],
    datasets: []
  };
  
  distributionChartData: ChartData<'doughnut'> = {
    labels: [],
    datasets: []
  };
  
  statusChartData: ChartData<'bar'> = {
    labels: [],
    datasets: []
  };
  
  performanceChartData: ChartData<'radar'> = {
    labels: [],
    datasets: []
  };
  
  // Chart Options
  timelineChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top'
      },
      tooltip: {
        mode: 'index',
        intersect: false
      }
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: 'Tempo'
        }
      },
      y: {
        display: true,
        title: {
          display: true,
          text: 'Numero Documenti'
        }
      }
    },
    elements: {
      line: {
        tension: 0.4
      }
    }
  };
  
  distributionChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'right'
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            return `${context.label}: ${context.parsed}%`;
          }
        }
      }
    }
  };
  
  statusChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top'
      }
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: 'Status'
        }
      },
      y: {
        display: true,
        title: {
          display: true,
          text: 'Numero Documenti'
        }
      }
    }
  };
  
  performanceChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top'
      }
    },
    scales: {
      r: {
        angleLines: {
          display: true
        },
        suggestedMin: 0,
        suggestedMax: 100
      }
    }
  };

  constructor() { }

  ngOnInit(): void {
    this.loadTenants();
    this.updateLastUpdateTime();
    
    // Update time every minute
    setInterval(() => {
      this.updateLastUpdateTime();
    }, 60000);
  }

  // Load mock tenants data
  loadTenants(): void {
    this.tenants = [
      {
        id: 'tenant-1',
        name: 'Production Environment',
        description: 'Ambiente di produzione principale'
      },
      {
        id: 'tenant-2',
        name: 'Development Environment',
        description: 'Ambiente di sviluppo e testing'
      },
      {
        id: 'tenant-3',
        name: 'Staging Environment',
        description: 'Ambiente di staging per test pre-produzione'
      }
    ];
  }

  // Handle tenant selection
  onTenantChange(): void {
    if (this.selectedTenant) {
      this.isLoading = true;
      this.activeTabIndex = -1;
      
      // Simulate API call delay
      setTimeout(() => {
        this.loadIndicesForTenant(this.selectedTenant);
        this.calculateStats();
        this.isLoading = false;
      }, 1500);
    } else {
      this.indices = [];
      this.documents = [];
      this.filteredDocuments = [];
      this.resetStats();
    }
  }

  // Load mock indices data for selected tenant
  loadIndicesForTenant(tenantId: string): void {
    const baseIndices = [
      {
        id: 'idx-logs',
        name: 'application-logs',
        documents: 1250000,
        size: '2.3 GB',
        created: new Date(2024, 0, 15),
        status: 'active'
      },
      {
        id: 'idx-metrics',
        name: 'system-metrics',
        documents: 875000,
        size: '1.8 GB',
        created: new Date(2024, 1, 3),
        status: 'active'
      },
      {
        id: 'idx-events',
        name: 'user-events',
        documents: 650000,
        size: '1.2 GB',
        created: new Date(2024, 2, 20),
        status: 'active'
      },
      {
        id: 'idx-errors',
        name: 'error-tracking',
        documents: 45000,
        size: '850 MB',
        created: new Date(2024, 3, 10),
        status: 'active'
      }
    ];

    // Modify data based on tenant
    this.indices = baseIndices.map(index => ({
      ...index,
      documents: index.documents + Math.floor(Math.random() * 100000),
      size: this.adjustSizeForTenant(index.size, tenantId)
    }));

    // Load documents for first index by default
    if (this.indices.length > 0) {
      this.selectTab(0);
    }
  }

  // Adjust size based on tenant
  adjustSizeForTenant(size: string, tenantId: string): string {
    const multiplier = tenantId === 'tenant-1' ? 1.5 : tenantId === 'tenant-2' ? 0.7 : 1.2;
    const numericValue = parseFloat(size.replace(/[^0-9.]/g, ''));
    const unit = size.replace(/[0-9.]/g, '').trim();
    return `${(numericValue * multiplier).toFixed(1)} ${unit}`;
  }

  // Select tab and load data
  selectTab(index: number): void {
    this.activeTabIndex = index;
    if (index >= 0 && index < this.indices.length) {
      this.loadDocumentsForIndex(this.indices[index].id);
      this.loadChartsForIndex(this.indices[index].id);
    }
  }

  // Load mock documents for selected index
  loadDocumentsForIndex(indexId: string): void {
    const documentTypes = ['log', 'metric', 'event', 'error'];
    const statuses = ['active', 'pending', 'error', 'archived'];
    
    this.documents = Array.from({ length: 50 }, (_, i) => ({
      id: `doc-${indexId}-${i + 1}`,
      timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
      type: documentTypes[Math.floor(Math.random() * documentTypes.length)],
      status: statuses[Math.floor(Math.random() * statuses.length)],
      size: `${Math.floor(Math.random() * 1000 + 100)} KB`
    }));
    
    this.filteredDocuments = [...this.documents];
  }

  // Load charts data for selected index
  loadChartsForIndex(indexId: string): void {
    this.loadTimelineChart();
    this.loadDistributionChart();
    this.loadStatusChart();
    this.loadPerformanceChart();
  }

  // Load timeline chart data
  loadTimelineChart(): void {
    const labels = [];
    const data = [];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      labels.push(date.toLocaleDateString('it-IT', { month: 'short', day: 'numeric' }));
      data.push(Math.floor(Math.random() * 10000 + 5000));
    }
    
    this.timelineChartData = {
      labels,
      datasets: [
        {
          label: 'Documenti Creati',
          data,
          borderColor: 'rgb(102, 126, 234)',
          backgroundColor: 'rgba(102, 126, 234, 0.2)',
          fill: true,
          tension: 0.4
        }
      ]
    };
  }

  // Load distribution chart data
  loadDistributionChart(): void {
    this.distributionChartData = {
      labels: ['Logs', 'Metrics', 'Events', 'Errors'],
      datasets: [
        {
          data: [45, 30, 20, 5],
          backgroundColor: [
            '#ff6b6b',
            '#4ecdc4',
            '#45b7d1',
            '#f9ca24'
          ],
          borderWidth: 2,
          borderColor: '#ffffff'
        }
      ]
    };
  }

  // Load status chart data
  loadStatusChart(): void {
    this.statusChartData = {
      labels: ['Active', 'Pending', 'Error', 'Archived'],
      datasets: [
        {
          label: 'Documenti per Status',
          data: [850, 120, 45, 200],
          backgroundColor: [
            '#2ecc71',
            '#f39c12',
            '#e74c3c',
            '#9b59b6'
          ],
          borderWidth: 1
        }
      ]
    };
  }

  // Load performance chart data
  loadPerformanceChart(): void {
    this.performanceChartData = {
      labels: ['Velocità', 'Affidabilità', 'Scalabilità', 'Sicurezza', 'Efficienza'],
      datasets: [
        {
          label: 'Performance Metrics',
          data: [85, 92, 78, 88, 90],
          backgroundColor: 'rgba(102, 126, 234, 0.2)',
          borderColor: 'rgb(102, 126, 234)',
          pointBackgroundColor: 'rgb(102, 126, 234)',
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: 'rgb(102, 126, 234)'
        }
      ]
    };
  }

  // Calculate dashboard stats
  calculateStats(): void {
    this.totalIndices = this.indices.length;
    this.totalDocuments = this.indices.reduce((sum, index) => sum + index.documents, 0);
    this.totalSize = this.calculateTotalSize();
  }

  // Calculate total size from all indices
  calculateTotalSize(): string {
    let totalMB = 0;
    
    this.indices.forEach(index => {
      const size = index.size;
      const value = parseFloat(size.replace(/[^0-9.]/g, ''));
      
      if (size.includes('GB')) {
        totalMB += value * 1024;
      } else if (size.includes('MB')) {
        totalMB += value;
      }
    });
    
    if (totalMB >= 1024) {
      return `${(totalMB / 1024).toFixed(1)} GB`;
    }
    return `${totalMB.toFixed(0)} MB`;
  }

  // Reset stats when no tenant selected
  resetStats(): void {
    this.totalIndices = 0;
    this.totalDocuments = 0;
    this.totalSize = '';
  }

  // Update last update time
  updateLastUpdateTime(): void {
    const now = new Date();
    this.lastUpdateTime = now.toLocaleTimeString('it-IT', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  }

  // Filter documents based on search term
  filterDocuments(): void {
    if (!this.searchTerm) {
      this.filteredDocuments = [...this.documents];
    } else {
      this.filteredDocuments = this.documents.filter(doc =>
        doc.id.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        doc.type.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        doc.status.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }
  }

  // Refresh chart data
  refreshChart(chartType: string): void {
    switch (chartType) {
      case 'timeline':
        this.loadTimelineChart();
        break;
      case 'distribution':
        this.loadDistributionChart();
        break;
      case 'status':
        this.loadStatusChart();
        break;
      case 'performance':
        this.loadPerformanceChart();
        break;
    }
  }

  // Refresh documents data
  refreshDocuments(): void {
    if (this.activeTabIndex >= 0) {
      this.loadDocumentsForIndex(this.indices[this.activeTabIndex].id);
    }
  }

  // View document details (placeholder)
  viewDocument(documentId: string): void {
    console.log('Viewing document:', documentId);
    // Here you would implement the logic to show document details
    // For example, open a modal or navigate to a detail page
  }
}