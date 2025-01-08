'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";

type DistributionType = {
  ticketOnline: number;
  ticketPreEvent: number;
  ticketDuringEvent: number;
  twoDayOffline: number;
  twoDayPreEvent: number;
  openTicket: number;
};

type PriceType = {
  base: number;
  fee: number;
};

type PricesType = {
  [K in keyof DistributionType | 'residentSingle' | 'residentOpen']: PriceType;
};

type DisplayNamesType = {
  [K in keyof DistributionType]: string;
};

const TicketAnalysis = () => {
  const [totalAttendees, setTotalAttendees] = useState(80000);
  const [distributions, setDistributions] = useState<DistributionType>({
    ticketOnline: 20,
    ticketPreEvent: 20,
    ticketDuringEvent: 20,
    twoDayOffline: 15,
    twoDayPreEvent: 15,
    openTicket: 10
  });
  
  const [residentPercent, setResidentPercent] = useState(30);
  const [isAutoBalance, setIsAutoBalance] = useState(true);
  const [lastModifiedKey, setLastModifiedKey] = useState<keyof DistributionType | null>(null);
  const [prices, setPrices] = useState<PricesType>({
    ticketOnline: { base: 7, fee: 1.50 },
    ticketPreEvent: { base: 7, fee: 1.50 },
    ticketDuringEvent: { base: 7, fee: 0 },
    twoDayOffline: { base: 12, fee: 0 },
    twoDayPreEvent: { base: 12, fee: 1.50 },
    openTicket: { base: 22, fee: 2.20 },
    residentSingle: { base: 5, fee: 0 },
    residentOpen: { base: 19, fee: 1.90 }
  });
  const [communePercentage, setCommunePercentage] = useState(40);

  // Funzione per bilanciare automaticamente le percentuali
  const balanceDistributions = (currentKey: keyof DistributionType, newValue: number) => {
    setLastModifiedKey(currentKey);
    
    if (!isAutoBalance) {
      setDistributions(prev => ({...prev, [currentKey]: newValue}));
      return;
    }

    const otherKeys = Object.keys(distributions).filter(k => k !== currentKey) as Array<keyof DistributionType>;
    
    // Calcola quanto spazio rimane per gli altri valori
    const remainingPercentage = 100 - newValue;
    
    // Se il valore rimanente è 0 o negativo, imposta tutti gli altri a 0
    if (remainingPercentage <= 0) {
      const newDistributions = { ...distributions };
      otherKeys.forEach(key => {
        newDistributions[key] = 0;
      });
      newDistributions[currentKey] = newValue;
      setDistributions(newDistributions);
      return;
    }

    // Calcola la somma attuale degli altri valori
    const currentSum = otherKeys.reduce((sum, key) => sum + distributions[key], 0);
    
    // Se la somma attuale è 0, distribuisci equamente
    if (currentSum === 0) {
      const valuePerKey = remainingPercentage / otherKeys.length;
      const newDistributions = {
        ...distributions,
        [currentKey]: newValue
      };
      otherKeys.forEach(key => {
        newDistributions[key] = Math.round(valuePerKey);
      });
      setDistributions(newDistributions);
      return;
    }

    // Altrimenti, mantieni le proporzioni relative tra gli altri valori
    const scaleFactor = remainingPercentage / currentSum;
    const newDistributions = {
      ...distributions,
      [currentKey]: newValue
    };
    otherKeys.forEach(key => {
      newDistributions[key] = Math.round(distributions[key] * scaleFactor);
    });

    setDistributions(newDistributions);
  };

  // Funzione per riattivare il bilanciamento automatico
  const handleAutoBalanceChange = (checked: boolean) => {
    setIsAutoBalance(checked);
    if (checked && lastModifiedKey) {
      balanceDistributions(lastModifiedKey, distributions[lastModifiedKey]);
    }
  };

  const displayNames: DisplayNamesType = {
    ticketOnline: 'Biglietto Singolo (Online)',
    ticketPreEvent: 'Biglietto Singolo (Pre-evento)',
    ticketDuringEvent: 'Biglietto Singolo (Durante Evento)',
    twoDayOffline: 'Abbonamento 2 Giorni (Offline)',
    twoDayPreEvent: 'Abbonamento 2 Giorni (Pre-evento)',
    openTicket: 'Abbonamento Open'
  };

  const calculateRevenue = () => {
    const nonResidentCount = totalAttendees * (1 - residentPercent/100);
    const residentCount = totalAttendees * (residentPercent/100);
    
    let grossRevenue = 0;
    let totalFees = 0;

    // Calcolo per non residenti
    Object.entries(distributions).forEach(([key, percentage]) => {
      const attendees = (nonResidentCount * percentage) / 100;
      const price = prices[key as keyof DistributionType];
      grossRevenue += attendees * price.base;
      totalFees += attendees * price.fee;
    });

    // Calcolo per residenti (70% biglietti singoli, 30% abbonamenti)
    const residentSingleCount = residentCount * 0.7;
    const residentOpenCount = residentCount * 0.3;
    
    grossRevenue += residentSingleCount * prices.residentSingle.base;
    grossRevenue += residentOpenCount * prices.residentOpen.base;
    totalFees += residentOpenCount * prices.residentOpen.fee;

    const iva = grossRevenue * 0.10;
    const siae = grossRevenue * 0.10;
    const netRevenue = grossRevenue - iva - siae - totalFees;
    const communeShare = netRevenue * (communePercentage/100);
    const finalNetRevenue = netRevenue - communeShare;

    return {
      gross: grossRevenue,
      fees: totalFees,
      iva,
      siae,
      net: netRevenue,
      commune: communeShare,
      final: finalNetRevenue
    };
  };

  const revenue = calculateRevenue();
  
  const distributionData = Object.entries(distributions).map(([key, value]) => ({
    name: displayNames[key as keyof DistributionType],
    percentage: value
  }));

  const revenueData = [
    { name: 'Ricavo Lordo', value: revenue.gross },
    { name: 'IVA (10%)', value: revenue.iva },
    { name: 'SIAE (10%)', value: revenue.siae },
    { name: 'Diritti Prevendita', value: revenue.fees },
    { name: 'Ricavo Netto', value: revenue.net },
    { name: `Quota Comune (${communePercentage}%)`, value: revenue.commune },
    { name: 'Ricavo Finale', value: revenue.final }
  ];

  const totalPercentage = Object.values(distributions).reduce((a, b) => a + b, 0);

  const updatePrice = (ticketType: keyof PricesType, field: 'base' | 'fee', value: string) => {
    const numValue = parseFloat(value) || 0;
    setPrices(prev => ({
      ...prev,
      [ticketType]: {
        ...prev[ticketType],
        [field]: numValue
      }
    }));
  };

  return (
    <div className="space-y-8 p-4">
      <Card>
        <CardHeader>
          <CardTitle>Analisi Incassi da Biglietti</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="distribution" className="space-y-4">
            <TabsList>
              <TabsTrigger value="distribution">Distribuzione</TabsTrigger>
              <TabsTrigger value="prices">Prezzi</TabsTrigger>
            </TabsList>

            <TabsContent value="distribution">
              <div className="space-y-8">
                {/* Prima riga: Parametri e Risultati */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Colonna sinistra - Parametri */}
                  <div className="space-y-6">
                    <div className="bg-secondary/50 p-4 rounded-lg">
                      <h3 className="text-lg font-medium mb-4">Parametri Generali</h3>
                      <div className="space-y-4">
                        <div>
                          <h4 className="text-sm font-medium mb-2">Numero totale acquisti: {totalAttendees.toLocaleString('it-IT')}</h4>
                          <Slider 
                            value={[totalAttendees]}
                            min={40000}
                            max={120000}
                            step={1000}
                            onValueChange={(value: number[]) => setTotalAttendees(value[0])}
                          />
                        </div>

                        <div>
                          <h4 className="text-sm font-medium mb-2">Percentuale residenti: {residentPercent}%</h4>
                          <Slider 
                            value={[residentPercent]}
                            min={0}
                            max={100}
                            step={1}
                            onValueChange={(value: number[]) => setResidentPercent(value[0])}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="bg-secondary/50 p-4 rounded-lg">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-medium">Distribuzione Biglietti</h3>
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-2">
                            <Switch
                              checked={isAutoBalance}
                              onCheckedChange={handleAutoBalanceChange}
                            />
                            <Label>Bilanciamento Automatico</Label>
                          </div>
                          <span className={`text-sm font-medium ${Math.abs(totalPercentage - 100) < 0.1 ? 'text-green-600' : 'text-red-500'}`}>
                            Totale: {totalPercentage.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                      <div className="space-y-4">
                        {Object.entries(distributions).map(([key, value]) => (
                          <div key={key} className="space-y-1">
                            <div className="flex justify-between items-center">
                              <p className="text-sm">{displayNames[key as keyof DistributionType]}</p>
                              <p className="text-sm font-medium">{value.toFixed(1)}%</p>
                            </div>
                            <Slider 
                              value={[value]}
                              min={0}
                              max={100}
                              step={1}
                              onValueChange={(newValue: number[]) => {
                                balanceDistributions(key as keyof DistributionType, newValue[0]);
                              }}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Colonna destra - Risultati */}
                  <div className="space-y-6">
                    <div className="bg-secondary/50 p-4 rounded-lg">
                      <h3 className="text-lg font-medium mb-4">Risultati Finanziari</h3>
                      <div className="grid grid-cols-1 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Ricavo Lordo</p>
                          <p className="text-2xl font-medium">€{revenue.gross.toLocaleString('it-IT', {maximumFractionDigits: 2})}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Ricavo Netto</p>
                          <p className="text-2xl font-medium">€{revenue.net.toLocaleString('it-IT', {maximumFractionDigits: 2})}</p>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-muted-foreground">Quota Comune</p>
                            <p className="text-2xl font-medium">€{revenue.commune.toLocaleString('it-IT', {maximumFractionDigits: 2})}</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Input
                              type="number"
                              min={0}
                              max={100}
                              value={communePercentage}
                              onChange={(e) => setCommunePercentage(Number(e.target.value))}
                              className="w-20"
                            />
                            <span className="text-sm">%</span>
                          </div>
                        </div>
                        <div className="mt-4 p-4 bg-primary/10 rounded-lg border-2 border-primary">
                          <p className="text-sm font-medium text-primary">Ricavo Finale Netto</p>
                          <p className="text-3xl font-bold text-primary">
                            €{revenue.final.toLocaleString('it-IT', {maximumFractionDigits: 2})}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-secondary/50 p-4 rounded-lg">
                      <h3 className="text-lg font-medium mb-4">Dettaglio Costi</h3>
                      <div className="space-y-2">
                        <div>
                          <p className="text-sm text-muted-foreground">IVA (10%)</p>
                          <p className="text-lg font-medium">€{revenue.iva.toLocaleString('it-IT', {maximumFractionDigits: 2})}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">SIAE (10%)</p>
                          <p className="text-lg font-medium">€{revenue.siae.toLocaleString('it-IT', {maximumFractionDigits: 2})}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Diritti Prevendita</p>
                          <p className="text-lg font-medium">€{revenue.fees.toLocaleString('it-IT', {maximumFractionDigits: 2})}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Seconda riga: Card Grafici */}
                <Card>
                  <CardHeader>
                    <CardTitle>Visualizzazione Dati</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                      <div className="bg-secondary/50 p-4 rounded-lg">
                        <h3 className="text-lg font-medium mb-4">Distribuzione Biglietti</h3>
                        <div className="h-[500px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart 
                              data={distributionData} 
                              layout="vertical" 
                              margin={{ left: 0, right: 50, top: 20, bottom: 20 }}
                            >
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis 
                                type="number"
                                tickFormatter={(value) => `${value}%`}
                              />
                              <YAxis 
                                dataKey="name" 
                                type="category" 
                                width={180}
                                tick={{ fontSize: 12 }}
                                tickFormatter={(value) => value}
                                interval={0}
                              />
                              <Tooltip 
                                formatter={(value) => [`${value}%`, 'Percentuale']}
                                contentStyle={{ fontSize: 12 }}
                              />
                              <Bar 
                                dataKey="percentage" 
                                fill="#82ca9d"
                                label={{ 
                                  position: 'right',
                                  formatter: (value: number) => `${value}%`,
                                  fontSize: 12,
                                  dx: 5
                                }}
                              />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>

                      <div className="bg-secondary/50 p-4 rounded-lg">
                        <h3 className="text-lg font-medium mb-4">Dettaglio Ricavi</h3>
                        <div className="h-[500px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart 
                              data={revenueData} 
                              margin={{ left: 20, right: 20, top: 20, bottom: 100 }}
                            >
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis 
                                dataKey="name" 
                                angle={-45} 
                                textAnchor="end" 
                                height={100}
                                tick={{ fontSize: 12 }}
                              />
                              <YAxis 
                                tickFormatter={(value) => `€${(value/1000).toFixed(0)}k`}
                                tick={{ fontSize: 12 }}
                              />
                              <Tooltip 
                                formatter={(value) => [`€${value.toLocaleString('it-IT', {maximumFractionDigits: 2})}`, 'Importo']}
                                contentStyle={{ fontSize: 12 }}
                              />
                              <Bar 
                                dataKey="value" 
                                fill="#8884d8"
                                label={{ 
                                  position: 'top',
                                  formatter: (value: number) => `€${(value/1000).toFixed(0)}k`,
                                  fontSize: 11
                                }}
                              />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="prices">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="bg-secondary/50 p-4 rounded-lg">
                    <h3 className="text-lg font-medium mb-4">Prezzi Biglietti Non Residenti</h3>
                    <div className="space-y-4">
                      {Object.entries(displayNames).map(([key]) => (
                        <div key={key} className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor={`${key}-base`}>{displayNames[key as keyof DistributionType]}</Label>
                            <div className="flex items-center space-x-2">
                              <span className="text-sm">€</span>
                              <Input
                                id={`${key}-base`}
                                type="number"
                                step="0.10"
                                value={prices[key as keyof PricesType].base}
                                onChange={(e) => updatePrice(key as keyof PricesType, 'base', e.target.value)}
                                className="w-24"
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor={`${key}-fee`}>Commissione</Label>
                            <div className="flex items-center space-x-2">
                              <span className="text-sm">€</span>
                              <Input
                                id={`${key}-fee`}
                                type="number"
                                step="0.10"
                                value={prices[key as keyof PricesType].fee}
                                onChange={(e) => updatePrice(key as keyof PricesType, 'fee', e.target.value)}
                                className="w-24"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="bg-secondary/50 p-4 rounded-lg">
                    <h3 className="text-lg font-medium mb-4">Prezzi Biglietti Residenti</h3>
                    <div className="space-y-4">
                      {['residentSingle', 'residentOpen'].map((key) => (
                        <div key={key} className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor={`${key}-base`}>
                              {key === 'residentSingle' ? 'Biglietto Singolo Residenti' : 'Abbonamento Open Residenti'}
                            </Label>
                            <div className="flex items-center space-x-2">
                              <span className="text-sm">€</span>
                              <Input
                                id={`${key}-base`}
                                type="number"
                                step="0.10"
                                value={prices[key as keyof PricesType].base}
                                onChange={(e) => updatePrice(key as keyof PricesType, 'base', e.target.value)}
                                className="w-24"
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor={`${key}-fee`}>Commissione</Label>
                            <div className="flex items-center space-x-2">
                              <span className="text-sm">€</span>
                              <Input
                                id={`${key}-fee`}
                                type="number"
                                step="0.10"
                                value={prices[key as keyof PricesType].fee}
                                onChange={(e) => updatePrice(key as keyof PricesType, 'fee', e.target.value)}
                                className="w-24"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default TicketAnalysis; 