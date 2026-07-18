// DTOs serializables que viajan del servidor a los componentes cliente.

export interface PrendaListaDTO {
  id: string;
  codigoInterno: string;
  nombre: string;
  categoria: string;
  subcategoria: string | null;
  genero: string;
  talle: string;
  precioVenta: number;
  costo: number;
  estado: string;
  fechaIngreso: string;
  usuario: string;
  imagenPrincipal: string | null;
  lote: string;
  loteId: string;
  proveedor: string;
  proveedorId: string;
}

export interface ImagenDTO {
  url: string;
  orden: number;
  esPrincipal: boolean;
}

export interface OpcionUsuario {
  id: string;
  nombre: string;
}

export interface OpcionLote {
  id: string;
  numero: string;
  proveedor: string;
  proveedorId: string;
}

export interface OpcionProveedor {
  id: string;
  nombre: string;
}

export interface OpcionesFiltroDTO {
  subcategorias: string[];
  talles: string[];
  usuarios: OpcionUsuario[];
  lotes: OpcionLote[];
  proveedores: OpcionProveedor[];
}
