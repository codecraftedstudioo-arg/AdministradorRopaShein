// DTOs serializables de Ventas (servidor -> componentes cliente).

export interface VentaDTO {
  id: string;
  fecha: string;
  canal: string;
  precioFinal: number;
  costo: number;
  ganancia: number;
  observaciones: string | null;
  prendaId: string;
  codigoInterno: string;
  nombre: string;
  categoria: string;
  imagen: string | null;
  vendedor: string;
  vendedorId: string;
}

export interface SalesFilterOptions {
  vendedores: { id: string; nombre: string }[];
}
