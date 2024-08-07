import { Injectable } from '@nestjs/common';
import { input, select } from '@inquirer/prompts';
import { OFFER } from 'src/constants';

@Injectable()
export class FeatureService {
  async getFeature() {
    return await select({
      message: 'Select feature',
      choices: [
        {
          name: 'Cost estimation with offer',
          value: 'costEstimation',
        },
        {
          name: 'Delivery Time Estimation',
          value: 'deliveryTimeEstimation',
        },
      ],
    });
  }

  async baseInput() {
    const answer = await input({
      message:
        'Please enter base cost and number of packages . \n Format: baseCost numOfPackages \n Example: 100 3 \n',
      required: true,
      validate: (answer: string) => {
        const splitInput = answer.split(' ');

        return splitInput.length === 2;
      },
    });
    const splitInput = answer.split(' ');

    const baseCost = parseFloat(splitInput[0]);
    const numOfPackages = parseInt(splitInput[1]);

    return {
      baseCost,
      numOfPackages,
    };
  }

  async costEstimationInput() {
    const answer = await input({
      message:
        'Please enter the information in this format. \n Format: packageId weight(KG) distance(KM) offerCode(Optional) \n Example: PKG3 10 100 OFR003 \n',
      required: true,
      validate: (answer: string) => {
        const splitInput = answer.split(' ');

        return splitInput.length > 2;
      },
    });
    const splitInput = answer.split(' ');

    const packageId = splitInput[0];
    const distance = parseFloat(splitInput[1]);
    const weight = parseFloat(splitInput[2]);
    const offerCode = splitInput[3];

    return {
      packageId,
      distance,
      weight,
      offerCode,
    };
  }

  async deliveryTimeEstimationInput() {
    const answer = await input({
      message:
        'Please enter the information in this format. \n Format: numOfVehicles maxSpeed maxWeight \n Example: 2 70 200 \n',
      required: true,
      validate: (answer: string) => {
        const splitInput = answer.split(' ');

        return splitInput.length === 3;
      },
    });
    const splitInput = answer.split(' ');
    const numOfVehicles = parseFloat(splitInput[0]);
    const maxSpeed = parseInt(splitInput[1]);
    const maxWeight = parseInt(splitInput[2]);

    return {
      numOfVehicles,
      maxSpeed,
      maxWeight,
    };
  }

  eligibleForDiscount(offer, distance, weight) {
    const { distance: distanceRule, weight: weightRule } = offer;

    const validDistance =
      distanceRule.min <= distance && distanceRule.max >= distance;
    const validWeight = weightRule.min <= weight && weightRule.max >= weight;

    return validDistance && validWeight;
  }

  async costEstimationCalculate(input) {
    const { baseCost, packages } = input;
    const packageCost = [];

    for (const pkg of packages) {
      const { packageId, weight, distance, offerCode } = pkg;

      const total = baseCost + weight * 10 + distance * 5;
      const offer = OFFER[offerCode];
      const result = {
        packageId,
        total,
        totalDiscount: 0,
      };

      if (offer) {
        if (this.eligibleForDiscount(offer, distance, weight)) {
          result.totalDiscount = total * offer.discount;
          result.total = result.total - result.totalDiscount;
        }
      }

      packageCost.push(result);
    }

    return packageCost.map(
      (p) => `${p.packageId} ${p.totalDiscount} ${p.total}`,
    );
  }

  async deliveryTimeEstimationCalculate(input) {
    const { baseCost, packages, numOfVehicles, maxSpeed, maxWeight } = input;
    const packageCost = [];

    for (const pkg of packages) {
      const { packageId, weight, distance, offerCode } = pkg;

      const total = baseCost + weight * 10 + distance * 5;
      const offer = OFFER[offerCode];
      const result = {
        packageId,
        total,
        totalDiscount: 0,
      };

      if (offer) {
        if (this.eligibleForDiscount(offer, distance, weight)) {
          result.totalDiscount = total * offer.discount;
          result.total = result.total - result.totalDiscount;
        }
      }

      packageCost.push(result);
    }

    return packageCost.map(
      (p) => `${p.packageId} ${p.totalDiscount} ${p.total}`,
    );
  }

  async overralFlow() {
    const feature = await this.getFeature();

    const { baseCost, numOfPackages } = await this.baseInput();

    const pkgs = [];
    for (let i = 1; i <= numOfPackages; i++) {
      const pkg = await this.costEstimationInput();
      pkgs.push(pkg);
    }

    const baseInput = { baseCost, packages: pkgs };

    if (feature === 'costEstimation') {
      const packageCost = await this.costEstimationCalculate(baseInput);

      packageCost.forEach((p) => {
        console.log(p);
      });
    }

    if (feature === 'deliveryTimeEstimation') {
      const deliveryEstimationInput = await this.deliveryTimeEstimationInput();
      const deliveryEstimation = await this.deliveryTimeEstimationCalculate({
        ...baseInput,
        ...deliveryEstimationInput,
      });

      deliveryEstimation.forEach((p) => {
        console.log(p);
      });
    }
  }
}
