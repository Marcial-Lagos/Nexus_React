import { render, screen } from '@testing-library/react';
import { expect, it } from 'vitest';
import ImagenProducto from './ImagenProducto.jsx';
import { productos } from '../data/nexus.js';
it('utiliza la fotografía original cuando existe', () => {
  render(<ImagenProducto producto={productos[0]} />);
  expect(screen.getByRole('img')).toHaveAttribute('src', '/img/teclado.jpg');
});
it('ofrece una ilustración accesible para productos sin fotografía original', () => {
  render(<ImagenProducto producto={productos[1]} />);
  expect(screen.getByRole('img')).toHaveAccessibleName(/Mouse Gamer: ilustración/);
  expect(screen.getByText('Ilustración')).toBeInTheDocument();
});

