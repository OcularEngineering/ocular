import { Readable, Transform, Writable } from 'stream';
import { Organisation } from '../../models';

export interface OcularFactory {
  /**
   * The app index by this ocular instance.
   */
  readonly type: string;

  /**
   * Instantiates and resolves an ocular for an organisation.
   */
  getOcular(organisation:Organisation): Promise<Readable>;
}