/*tslint:disable:no-else-after-return*/

import { BaseStep, Field, StepInterface } from '../core/base-step';
import { Step, FieldDefinition, StepDefinition } from '../proto/cog_pb';

export class LeadFieldEqualsStep extends BaseStep implements StepInterface {

  protected stepName: string = 'Check Marketo Lead Field for Value';
  // tslint:disable-next-line:max-line-length
  protected stepExpression: string = 'the (?<field>[a-zA-Z0-9_-]+) field on (?<email>.+) should equal (?<expectation>.+) in marketo';
  protected stepType: StepDefinition.Type = StepDefinition.Type.VALIDATION;
  protected expectedFields: Field[] = [{
    field: 'email',
    type: FieldDefinition.Type.EMAIL,
    description: 'The email address of the Marketo lead to inspect.',
  }, {
    field: 'field',
    type: FieldDefinition.Type.STRING,
    description: 'The REST API field name of the Lead field to inspect.',
  }, {
    field: 'expectation',
    type: FieldDefinition.Type.ANYSCALAR,
    description: 'The expected field value.',
  }];

  async executeStep(step: Step) {
    const stepData: any = step.getData() ? step.getData().toJavaScript() : {};
    const expectation = stepData.expectation;
    const email = stepData.email;
    const field = stepData.field;

    try {
      const data: any = await this.client.findLeadByEmail(email, {
        fields: ['email', field].join(','),
      });

      if (data.success && data.result && data.result[0] && data.result[0][field]) {
        // tslint:disable-next-line:triple-equals
        if (data.result[0][field] == expectation) {
          return this.pass('The %s field was %s, as expected.', [
            field,
            data.result[0][field],
          ]);
        } else {
          return this.fail('Expected %s to be %s, but it was actually %s.', [
            field,
            expectation,
            data.result[0][field],
          ]);
        }
      } else {
        return this.error("Couldn't find a lead associated with %s", [
          email,
          data,
        ]);
      }
    } catch (e) {
      return this.error('There was an error loading leads from Marketo: %s', [e.toString()]);
    }
  }

}

export { LeadFieldEqualsStep as Step };
