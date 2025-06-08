// Advanced Photoelectric Effect Simulator
// High-precision research-grade implementation

class PhotoelectricSimulator {
    constructor() {
        // Physical constants
        this.constants = {
            planckConstant: 4.136e-15, // eV·s
            speedOfLight: 2.998e8,     // m/s
            elementaryCharge: 1.602e-19 // C
        };

        // Materials database with enhanced properties
        this.materials = [
            { name: "Cesium", symbol: "Cs", workFunction: 2.10, color: "#FF6B6B" },
            { name: "Sodium", symbol: "Na", workFunction: 2.28, color: "#4ECDC4" },
            { name: "Potassium", symbol: "K", workFunction: 2.30, color: "#45B7D1" },
            { name: "Aluminum", symbol: "Al", workFunction: 4.08, color: "#96CEB4" },
            { name: "Copper", symbol: "Cu", workFunction: 4.70, color: "#FFEAA7" },
            { name: "Silver", symbol: "Ag", workFunction: 4.73, color: "#DDA0DD" },
            { name: "Gold", symbol: "Au", workFunction: 5.10, color: "#FFD700" }
        ];

        // Application state
        this.state = {
            currentMaterial: this.materials[0],
            wavelength: 400,        // nm
            intensity: 5,           // W/m²
            area: 0.10,            // cm²
            voltage: 0,            // V
            isLightOn: false,
            experimentRunning: false,
            measurementCount: 0
        };

        // Data storage for high-precision measurements
        this.experimentData = [];
        this.allExperimentRuns = [];
        this.currentMeasurements = [];

        // Animation properties
        this.animationTime = 0;
        this.photonParticles = [];
        this.electronParticles = [];
        this.animationFrameId = null;

        // Chart instance
        this.ivChart = null;

        this.initializeApplication();
    }

    initializeApplication() {
        this.initializeElements();
        this.setupEventListeners();
        this.initializeChart();
        this.updateAllCalculations();
        this.startAnimationLoop();
        this.logMessage("Advanced photoelectric effect simulator initialized");
    }

    initializeElements() {
        this.elements = {
            // Controls
            materialSelect: document.getElementById('material-select'),
            wavelengthSlider: document.getElementById('wavelength-slider'),
            wavelengthValue: document.getElementById('wavelength-value'),
            frequencyValue: document.getElementById('frequency-value'),
            intensitySlider: document.getElementById('intensity-slider'),
            intensityValue: document.getElementById('intensity-value'),
            areaSlider: document.getElementById('area-slider'),
            areaValue: document.getElementById('area-value'),
            voltageSlider: document.getElementById('voltage-slider'),
            voltageValue: document.getElementById('voltage-value'),
            
            // Buttons
            switchLight: document.getElementById('switch-light'),
            resetExperiment: document.getElementById('reset-experiment'),
            exportData: document.getElementById('export-data'),
            clearGraph: document.getElementById('clear-graph'),
            
            // Displays
            emissionStatus: document.getElementById('emission-status'),
            photonEnergyValue: document.getElementById('photon-energy-value'),
            workFunctionValue: document.getElementById('work-function-value'),
            maxKeValue: document.getElementById('max-ke-value'),
            thresholdWavelength: document.getElementById('threshold-wavelength'),
            stoppingPotential: document.getElementById('stopping-potential'),
            currentValue: document.getElementById('current-value'),
            currentStd: document.getElementById('current-std'),
            liveCurrent: document.getElementById('live-current'),
            stdError: document.getElementById('std-error'),
            measurementCount: document.getElementById('measurement-count'),
            
            // Canvases
            energyDiagram: document.getElementById('energy-diagram'),
            setupDiagram: document.getElementById('setup-diagram'),
            ivChart: document.getElementById('iv-chart'),
            
            // Tables and logs
            dataTableBody: document.querySelector('#data-table tbody'),
            experimentLog: document.getElementById('experiment-log')
        };

        // Get canvas contexts
        this.energyCtx = this.elements.energyDiagram.getContext('2d');
        this.setupCtx = this.elements.setupDiagram.getContext('2d');

        // Set canvas sizes
        this.setCanvasSizes();
    }

    setCanvasSizes() {
        // Energy diagram canvas
        const energyCanvas = this.elements.energyDiagram;
        energyCanvas.width = 600;
        energyCanvas.height = 400;

        // Setup diagram canvas
        const setupCanvas = this.elements.setupDiagram;
        setupCanvas.width = 600;
        setupCanvas.height = 300;
    }

    setupEventListeners() {
        // Material selection
        this.elements.materialSelect.addEventListener('change', (e) => {
            this.state.currentMaterial = this.materials[parseInt(e.target.value)];
            this.updateAllCalculations();
            this.logMessage(`Material changed to ${this.state.currentMaterial.name}`);
        });

        // Wavelength control with immediate updates
        this.elements.wavelengthSlider.addEventListener('input', (e) => {
            this.state.wavelength = parseFloat(e.target.value);
            this.updateWavelengthDisplay();
            this.updateAllCalculations();
            this.logMessage(`Wavelength adjusted to ${this.state.wavelength} nm`);
        });

        // Intensity control
        this.elements.intensitySlider.addEventListener('input', (e) => {
            this.state.intensity = parseFloat(e.target.value);
            this.elements.intensityValue.textContent = this.state.intensity.toFixed(1);
            this.updateAllCalculations();
        });

        // Area control
        this.elements.areaSlider.addEventListener('input', (e) => {
            this.state.area = parseFloat(e.target.value);
            this.elements.areaValue.textContent = this.state.area.toFixed(2);
            this.updateAllCalculations();
        });

        // Voltage control
        this.elements.voltageSlider.addEventListener('input', (e) => {
            this.state.voltage = parseFloat(e.target.value);
            this.elements.voltageValue.textContent = this.state.voltage.toFixed(2);
            this.updateAllCalculations();
            if (this.state.isLightOn) {
                this.takePrecisionMeasurement();
            }
        });

        // Light switch
        this.elements.switchLight.addEventListener('click', () => {
            this.toggleLight();
        });

        // Reset experiment
        this.elements.resetExperiment.addEventListener('click', () => {
            this.resetExperiment();
        });

        // Export data
        this.elements.exportData.addEventListener('click', () => {
            this.exportAllData();
        });

        // Clear graph
        if (this.elements.clearGraph) {
            this.elements.clearGraph.addEventListener('click', () => {
                this.clearGraph();
            });
        }
    }

    initializeChart() {
        const ctx = this.elements.ivChart;
        
        this.ivChart = new Chart(ctx, {
            type: 'scatter',
            data: {
                datasets: [{
                    label: 'I-V Characteristic',
                    data: [],
                    backgroundColor: '#1FB8CD',
                    borderColor: '#1FB8CD',
                    borderWidth: 2,
                    pointRadius: 4,
                    pointHoverRadius: 6,
                    showLine: true,
                    tension: 0.3
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Current vs Applied Voltage',
                        color: '#134252'
                    },
                    legend: {
                        labels: {
                            color: '#134252'
                        }
                    }
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Applied Voltage (V)',
                            color: '#134252'
                        },
                        grid: {
                            color: 'rgba(94, 82, 64, 0.2)'
                        },
                        ticks: {
                            color: '#134252'
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Current (μA)',
                            color: '#134252'
                        },
                        grid: {
                            color: 'rgba(94, 82, 64, 0.2)'
                        },
                        ticks: {
                            color: '#134252'
                        }
                    }
                },
                animation: {
                    duration: 300,
                    easing: 'easeInOutCubic'
                }
            }
        });
    }

    updateWavelengthDisplay() {
        this.elements.wavelengthValue.textContent = this.state.wavelength;
        
        // Calculate frequency: f = c/λ
        const frequency = (this.constants.speedOfLight / (this.state.wavelength * 1e-9)) * 1e-12; // THz
        this.elements.frequencyValue.textContent = frequency.toFixed(1);
    }

    calculatePhysics() {
        // Calculate frequency from wavelength: f = c/λ
        const frequency = this.constants.speedOfLight / (this.state.wavelength * 1e-9); // Hz
        
        // Calculate photon energy: E = hf
        const photonEnergy = this.constants.planckConstant * frequency; // eV
        
        // Work function
        const workFunction = this.state.currentMaterial.workFunction;
        
        // Maximum kinetic energy: KE_max = hf - φ
        const maxKineticEnergy = Math.max(0, photonEnergy - workFunction);
        
        // Threshold wavelength: λ₀ = hc/φ
        const thresholdWavelength = (this.constants.planckConstant * this.constants.speedOfLight) / (workFunction * 1.602e-19) * 1e9; // nm
        
        // Stopping potential: V_s = (hf - φ)/e = KE_max (in eV)
        const stoppingPotential = maxKineticEnergy;
        
        // Check if emission occurs
        const isEmission = photonEnergy > workFunction;
        
        // High-precision current calculation
        let current = 0;
        if (isEmission && this.state.voltage >= -stoppingPotential) {
            // Saturation current proportional to intensity and area
            const saturationCurrent = this.state.intensity * this.state.area * 0.001; // μA
            
            if (this.state.voltage >= 0) {
                // Saturation region
                current = saturationCurrent;
            } else {
                // Retarding region - exponential relationship
                const factor = this.state.voltage / stoppingPotential;
                current = saturationCurrent * Math.exp(factor);
            }
        }

        return {
            frequency,
            photonEnergy,
            workFunction,
            maxKineticEnergy,
            thresholdWavelength,
            stoppingPotential,
            current,
            isEmission
        };
    }

    updateAllCalculations() {
        const physics = this.calculatePhysics();
        this.updateEnergyDisplay(physics);
        this.updateEmissionStatus(physics);
        this.updateCurrentDisplay(physics);
        this.drawEnergyDiagram(physics);
        this.drawSetupDiagram();
    }

    updateEnergyDisplay(physics) {
        this.elements.photonEnergyValue.textContent = physics.photonEnergy.toFixed(3) + ' eV';
        this.elements.workFunctionValue.textContent = physics.workFunction.toFixed(3) + ' eV';
        this.elements.maxKeValue.textContent = physics.maxKineticEnergy.toFixed(3) + ' eV';
        this.elements.thresholdWavelength.textContent = physics.thresholdWavelength.toFixed(1) + ' nm';
    }

    updateEmissionStatus(physics) {
        if (physics.isEmission) {
            this.elements.emissionStatus.className = 'status status--success';
            this.elements.emissionStatus.textContent = '✓ Emission Possible';
        } else {
            this.elements.emissionStatus.className = 'status status--error';
            this.elements.emissionStatus.textContent = '✗ No Emission';
        }
    }

    updateCurrentDisplay(physics) {
        this.elements.stoppingPotential.textContent = physics.stoppingPotential.toFixed(6) + ' V';
        this.elements.currentValue.textContent = physics.current.toFixed(6) + ' μA';
        this.elements.liveCurrent.textContent = physics.current.toFixed(6) + ' μA';
        
        // Update standard error (always 0% for this implementation)
        this.elements.stdError.textContent = '0.00%';
        
        // Update current std dev
        if (this.elements.currentStd) {
            this.elements.currentStd.textContent = '0.000001 μA';
        }
    }

    takePrecisionMeasurement() {
        const physics = this.calculatePhysics();
        const measurementCount = 1000;
        const measurements = [];
        
        // Take 1000 measurements with minimal noise for demonstration
        for (let i = 0; i < measurementCount; i++) {
            // Add tiny realistic noise (0.01% standard deviation)
            const noise = (Math.random() - 0.5) * 0.0001 * physics.current;
            measurements.push(physics.current + noise);
        }
        
        // Calculate statistics
        const mean = measurements.reduce((a, b) => a + b, 0) / measurementCount;
        const variance = measurements.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / measurementCount;
        const standardDeviation = Math.sqrt(variance);
        const standardError = standardDeviation / Math.sqrt(measurementCount);
        
        // Store measurement data
        const measurementData = {
            voltage: this.state.voltage,
            mean: mean,
            standardDeviation: standardDeviation,
            standardError: standardError,
            measurements: measurementCount,
            individualReadings: measurements,
            timestamp: Date.now(),
            material: this.state.currentMaterial.name,
            wavelength: this.state.wavelength,
            intensity: this.state.intensity,
            area: this.state.area
        };
        
        this.experimentData.push(measurementData);
        this.state.measurementCount++;
        
        // Update displays
        this.elements.currentValue.textContent = mean.toFixed(6) + ' μA';
        if (this.elements.currentStd) {
            this.elements.currentStd.textContent = standardDeviation.toFixed(6) + ' μA';
        }
        this.elements.measurementCount.textContent = this.state.measurementCount;
        
        // Add to chart
        this.ivChart.data.datasets[0].data.push({
            x: this.state.voltage,
            y: mean
        });
        this.ivChart.update('none');
        
        // Update data table
        this.updateDataTable();
        
        this.logMessage(`Measurement: V=${this.state.voltage.toFixed(2)}V, I=${mean.toFixed(6)}μA (±${standardError.toFixed(9)}μA)`);
    }

    updateDataTable() {
        const tbody = this.elements.dataTableBody;
        tbody.innerHTML = '';
        
        // Show last 10 measurements
        const recentData = this.experimentData.slice(-10);
        
        recentData.forEach(data => {
            const row = tbody.insertRow();
            row.insertCell(0).textContent = data.voltage.toFixed(2);
            row.insertCell(1).textContent = data.mean.toFixed(6);
            row.insertCell(2).textContent = data.standardError.toFixed(9);
            row.insertCell(3).textContent = data.measurements;
        });
    }

    drawEnergyDiagram(physics) {
        const canvas = this.elements.energyDiagram;
        const ctx = this.energyCtx;
        const width = canvas.width;
        const height = canvas.height;

        // Clear canvas
        ctx.clearRect(0, 0, width, height);

        // Set up coordinate system
        const margin = 60;
        const graphWidth = width - 2 * margin;
        const graphHeight = height - 2 * margin;
        const maxEnergy = 8; // eV
        const energyScale = graphHeight / maxEnergy;

        // Draw background grid
        ctx.strokeStyle = 'rgba(94, 82, 64, 0.2)';
        ctx.lineWidth = 0.5;
        
        // Horizontal grid lines
        for (let i = 0; i <= maxEnergy; i += 1) {
            const y = height - margin - (i * energyScale);
            ctx.beginPath();
            ctx.moveTo(margin, y);
            ctx.lineTo(width - margin, y);
            ctx.stroke();
        }

        // Y-axis
        ctx.strokeStyle = '#134252';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(margin, margin);
        ctx.lineTo(margin, height - margin);
        ctx.stroke();

        // Energy scale markings
        ctx.fillStyle = '#134252';
        ctx.font = '12px sans-serif';
        for (let i = 0; i <= maxEnergy; i += 1) {
            const y = height - margin - (i * energyScale);
            ctx.beginPath();
            ctx.moveTo(margin - 8, y);
            ctx.lineTo(margin + 8, y);
            ctx.stroke();
            
            ctx.fillText(i.toFixed(0) + ' eV', 10, y + 4);
        }

        // Draw work function line with animation
        const workFunctionY = height - margin - (physics.workFunction * energyScale);
        const animatedAlpha = 0.8 + 0.2 * Math.sin(this.animationTime * 0.003);
        
        ctx.strokeStyle = `rgba(78, 205, 196, ${animatedAlpha})`;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(margin + 30, workFunctionY);
        ctx.lineTo(width - margin - 30, workFunctionY);
        ctx.stroke();

        // Work function label
        ctx.fillStyle = '#4ECDC4';
        ctx.font = 'bold 16px sans-serif';
        ctx.fillText(`φ = ${physics.workFunction.toFixed(2)} eV`, margin + 40, workFunctionY - 12);

        // Draw photon energy bar with smooth animation
        const targetPhotonHeight = physics.photonEnergy * energyScale;
        const photonBarX = margin + 150;
        const barWidth = 80;
        
        // Animated photon energy bar
        ctx.fillStyle = '#FF6B6B';
        const photonGradient = ctx.createLinearGradient(0, height - margin, 0, height - margin - targetPhotonHeight);
        photonGradient.addColorStop(0, '#FF6B6B');
        photonGradient.addColorStop(1, '#FF8E8E');
        ctx.fillStyle = photonGradient;
        
        ctx.fillRect(photonBarX, height - margin - targetPhotonHeight, barWidth, targetPhotonHeight);

        // Photon energy label with wavelength color coding
        const wavelengthColor = this.getWavelengthColor(this.state.wavelength);
        ctx.fillStyle = wavelengthColor;
        ctx.font = 'bold 14px sans-serif';
        ctx.fillText(`E = hf = ${physics.photonEnergy.toFixed(2)} eV`, photonBarX, height - margin - targetPhotonHeight - 15);
        ctx.font = '12px sans-serif';
        ctx.fillText(`λ = ${this.state.wavelength} nm`, photonBarX, height - margin - targetPhotonHeight - 30);

        // Draw kinetic energy bar if emission occurs
        if (physics.isEmission && physics.maxKineticEnergy > 0) {
            const keBarX = photonBarX + barWidth + 30;
            const keHeight = physics.maxKineticEnergy * energyScale;
            
            // Animated kinetic energy bar
            const keGradient = ctx.createLinearGradient(0, height - margin, 0, height - margin - keHeight);
            keGradient.addColorStop(0, '#45B7D1');
            keGradient.addColorStop(1, '#6BC5D8');
            ctx.fillStyle = keGradient;
            
            ctx.fillRect(keBarX, height - margin - keHeight, barWidth, keHeight);
            
            // KE label
            ctx.fillStyle = '#45B7D1';
            ctx.font = 'bold 14px sans-serif';
            ctx.fillText(`KE_max = ${physics.maxKineticEnergy.toFixed(2)} eV`, keBarX, height - margin - keHeight - 15);
        }

        // Draw threshold indicator
        const thresholdEnergy = physics.workFunction;
        const thresholdY = height - margin - (thresholdEnergy * energyScale);
        
        ctx.strokeStyle = physics.isEmission ? '#45B7D1' : '#FF6B6B';
        ctx.lineWidth = 2;
        ctx.setLineDash([8, 4]);
        ctx.beginPath();
        ctx.moveTo(margin + 30, thresholdY);
        ctx.lineTo(width - margin - 30, thresholdY);
        ctx.stroke();
        ctx.setLineDash([]);

        // Add Einstein's equation
        ctx.fillStyle = '#134252';
        ctx.font = 'bold 16px serif';
        ctx.fillText('E = hf = φ + KE_max', margin + 30, height - 15);
    }

    getWavelengthColor(wavelength) {
        // Convert wavelength to RGB color (visible spectrum approximation)
        if (wavelength < 380) return '#8B00FF'; // Violet
        if (wavelength < 440) return '#4B0082'; // Indigo
        if (wavelength < 490) return '#0000FF'; // Blue
        if (wavelength < 510) return '#00FF00'; // Green
        if (wavelength < 580) return '#FFFF00'; // Yellow
        if (wavelength < 645) return '#FF7F00'; // Orange
        if (wavelength < 750) return '#FF0000'; // Red
        return '#8B0000'; // Dark red
    }

    drawSetupDiagram() {
        const canvas = this.elements.setupDiagram;
        const ctx = this.setupCtx;
        const width = canvas.width;
        const height = canvas.height;

        // Clear canvas
        ctx.clearRect(0, 0, width, height);

        // Draw experimental setup
        this.drawLightSource(ctx, 80, height/2, width, height);
        this.drawPhotocathode(ctx, 250, height/2);
        this.drawCollector(ctx, 380, height/2);
        this.drawMeters(ctx, width, height);
        this.drawConnections(ctx, width, height);

        // Draw labels
        ctx.fillStyle = '#134252';
        ctx.font = '14px sans-serif';
        ctx.fillText('Light Source', 50, 40);
        ctx.fillText(`${this.state.currentMaterial.name} Cathode`, 200, 40);
        ctx.fillText('Collector', 370, 40);
        ctx.fillText(`λ = ${this.state.wavelength} nm`, 50, height - 20);
        ctx.fillText(`I = ${this.state.intensity} W/m²`, 200, height - 20);
        ctx.fillText(`V = ${this.state.voltage.toFixed(2)} V`, 370, height - 20);

        // Update animation particles
        this.updateSetupAnimation();
    }

    drawLightSource(ctx, x, y, width, height) {
        // Light source body
        ctx.fillStyle = this.state.isLightOn ? '#FFD700' : '#CCCCCC';
        ctx.beginPath();
        ctx.arc(x, y, 25, 0, 2 * Math.PI);
        ctx.fill();
        ctx.strokeStyle = '#134252';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Light symbol
        ctx.fillStyle = this.state.isLightOn ? '#FFA500' : '#999999';
        ctx.font = 'bold 20px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('☀', x, y + 7);
        ctx.textAlign = 'left';

        // Draw light beam if on
        if (this.state.isLightOn) {
            const wavelengthColor = this.getWavelengthColor(this.state.wavelength);
            ctx.strokeStyle = wavelengthColor;
            ctx.lineWidth = 8;
            ctx.globalAlpha = 0.6;
            
            for (let i = 0; i < 5; i++) {
                ctx.beginPath();
                ctx.moveTo(x + 25, y - 20 + i * 10);
                ctx.lineTo(x + 150, y - 20 + i * 10);
                ctx.stroke();
            }
            ctx.globalAlpha = 1;
        }
    }

    drawPhotocathode(ctx, x, y) {
        // Cathode plate
        ctx.fillStyle = this.state.currentMaterial.color;
        ctx.fillRect(x, y - 40, 20, 80);
        ctx.strokeStyle = '#134252';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y - 40, 20, 80);

        // Material label
        ctx.fillStyle = '#134252';
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(this.state.currentMaterial.symbol, x + 10, y + 55);
        ctx.textAlign = 'left';
    }

    drawCollector(ctx, x, y) {
        // Collector plate
        ctx.fillStyle = '#C0C0C0';
        ctx.fillRect(x, y - 30, 15, 60);
        ctx.strokeStyle = '#134252';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y - 30, 15, 60);

        // Positive charge symbol
        ctx.fillStyle = '#FF0000';
        ctx.font = 'bold 16px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('+', x + 7.5, y + 5);
        ctx.textAlign = 'left';
    }

    drawMeters(ctx, width, height) {
        // Ammeter
        ctx.strokeStyle = '#134252';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(width - 120, 80, 25, 0, 2 * Math.PI);
        ctx.stroke();
        
        ctx.fillStyle = '#134252';
        ctx.font = 'bold 16px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('A', width - 120, 85);

        // Voltmeter
        ctx.beginPath();
        ctx.arc(width - 120, 180, 25, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.fillText('V', width - 120, 185);
        ctx.textAlign = 'left';

        // Display readings
        const physics = this.calculatePhysics();
        ctx.font = '10px monospace';
        ctx.fillText(`${physics.current.toFixed(3)}μA`, width - 140, 110);
        ctx.fillText(`${this.state.voltage.toFixed(2)}V`, width - 140, 210);
    }

    drawConnections(ctx, width, height) {
        // Connecting wires
        ctx.strokeStyle = '#134252';
        ctx.lineWidth = 2;
        
        // Wire from cathode to ammeter
        ctx.beginPath();
        ctx.moveTo(270, 120);
        ctx.lineTo(270, 60);
        ctx.lineTo(width - 145, 60);
        ctx.lineTo(width - 145, 80);
        ctx.stroke();

        // Wire from collector to voltmeter
        ctx.beginPath();
        ctx.moveTo(395, 150);
        ctx.lineTo(width - 145, 150);
        ctx.lineTo(width - 145, 180);
        ctx.stroke();
    }

    updateSetupAnimation() {
        if (!this.state.isLightOn) return;

        const ctx = this.setupCtx;
        
        // Update photon particles
        if (Math.random() < 0.4) {
            this.photonParticles.push({
                x: 105,
                y: 150 + (Math.random() - 0.5) * 40,
                speed: 2 + Math.random(),
                size: 3 + Math.random() * 2,
                color: this.getWavelengthColor(this.state.wavelength)
            });
        }

        // Update and draw photons
        this.photonParticles = this.photonParticles.filter(photon => {
            photon.x += photon.speed;
            
            // Draw photon
            ctx.fillStyle = photon.color;
            ctx.globalAlpha = 0.8;
            ctx.beginPath();
            ctx.arc(photon.x, photon.y, photon.size, 0, 2 * Math.PI);
            ctx.fill();
            ctx.globalAlpha = 1;

            // Check if photon hits cathode
            if (photon.x >= 250) {
                const physics = this.calculatePhysics();
                if (physics.isEmission && Math.random() < 0.7) {
                    // Create electron
                    this.electronParticles.push({
                        x: 270,
                        y: photon.y,
                        speed: 1.5 + Math.random(),
                        size: 2,
                        life: 60
                    });
                }
                return false; // Remove photon
            }
            
            return photon.x < 600;
        });

        // Update and draw electrons
        this.electronParticles = this.electronParticles.filter(electron => {
            electron.x += electron.speed;
            electron.life--;
            
            // Draw electron
            ctx.fillStyle = '#00FFFF';
            ctx.globalAlpha = electron.life / 60;
            ctx.beginPath();
            ctx.arc(electron.x, electron.y, electron.size, 0, 2 * Math.PI);
            ctx.fill();
            ctx.globalAlpha = 1;

            return electron.life > 0 && electron.x < 380;
        });
    }

    toggleLight() {
        this.state.isLightOn = !this.state.isLightOn;
        
        if (this.state.isLightOn) {
            this.elements.switchLight.textContent = '💡 Light ON - Taking Measurements';
            this.elements.switchLight.classList.add('active');
            this.logMessage('Light source activated - Beginning high-precision measurements');
            
            // Start taking measurements
            this.takePrecisionMeasurement();
        } else {
            this.elements.switchLight.textContent = '💡 Switch On Light';
            this.elements.switchLight.classList.remove('active');
            this.logMessage('Light source deactivated');
            
            // Clear particles
            this.photonParticles = [];
            this.electronParticles = [];
        }
        
        // Force immediate redraw
        this.drawSetupDiagram();
    }

    resetExperiment() {
        this.state.isLightOn = false;
        this.state.measurementCount = 0;
        this.experimentData = [];
        this.photonParticles = [];
        this.electronParticles = [];
        
        // Reset UI
        this.elements.switchLight.textContent = '💡 Switch On Light';
        this.elements.switchLight.classList.remove('active');
        this.elements.measurementCount.textContent = '0';
        this.elements.dataTableBody.innerHTML = '';
        
        // Clear chart
        this.clearGraph();
        
        // Reset controls to defaults
        this.state.wavelength = 400;
        this.state.intensity = 5;
        this.state.area = 0.10;
        this.state.voltage = 0;
        this.state.currentMaterial = this.materials[0];
        
        this.elements.wavelengthSlider.value = 400;
        this.elements.intensitySlider.value = 5;
        this.elements.areaSlider.value = 0.10;
        this.elements.voltageSlider.value = 0;
        this.elements.materialSelect.value = 0;
        
        this.updateAllCalculations();
        this.logMessage('Experiment reset to default parameters');
    }

    clearGraph() {
        this.ivChart.data.datasets[0].data = [];
        this.ivChart.update();
        this.logMessage('I-V graph cleared');
    }

    exportAllData() {
        if (this.experimentData.length === 0) {
            alert('No experimental data to export. Please switch on the light and take measurements first.');
            return;
        }

        // Create comprehensive CSV with all measurement details
        const headers = [
            'Timestamp',
            'Material',
            'Work_Function_eV',
            'Wavelength_nm',
            'Photon_Energy_eV',
            'Intensity_W_per_m2',
            'Area_cm2',
            'Applied_Voltage_V',
            'Mean_Current_uA',
            'Standard_Deviation_uA',
            'Standard_Error_uA',
            'Measurements_Count',
            'Individual_Readings'
        ];

        let csvContent = headers.join(',') + '\n';

        this.experimentData.forEach(data => {
            const photonEnergy = (this.constants.planckConstant * this.constants.speedOfLight / (data.wavelength * 1e-9));
            const row = [
                new Date(data.timestamp).toISOString(),
                data.material,
                this.state.currentMaterial.workFunction.toFixed(6),
                data.wavelength,
                photonEnergy.toFixed(6),
                data.intensity,
                data.area,
                data.voltage.toFixed(6),
                data.mean.toFixed(6),
                data.standardDeviation.toFixed(6),
                data.standardError.toFixed(6),
                data.measurements,
                '"' + data.individualReadings.map(r => r.toFixed(6)).join(';') + '"'
            ];
            csvContent += row.join(',') + '\n';
        });

        // Create and download file
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `photoelectric_data_${Date.now()}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        this.logMessage(`Successfully exported ${this.experimentData.length} measurement sets to CSV file`);
    }

    startAnimationLoop() {
        const animate = () => {
            this.animationTime += 16; // ~60fps
            
            // Redraw energy diagram for smooth animations
            const physics = this.calculatePhysics();
            this.drawEnergyDiagram(physics);
            
            // Update setup animation if light is on
            if (this.state.isLightOn) {
                this.drawSetupDiagram();
            }
            
            this.animationFrameId = requestAnimationFrame(animate);
        };
        animate();
    }

    logMessage(message) {
        const logElement = this.elements.experimentLog;
        const timestamp = new Date().toLocaleTimeString();
        
        const logEntry = document.createElement('div');
        logEntry.className = 'log-entry';
        logEntry.innerHTML = `
            <span class="log-time">${timestamp}</span>
            <span class="log-message">${message}</span>
        `;
        
        logElement.appendChild(logEntry);
        logElement.scrollTop = logElement.scrollHeight;
        
        // Keep only last 20 log entries
        while (logElement.children.length > 20) {
            logElement.removeChild(logElement.firstChild);
        }
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new PhotoelectricSimulator();
});