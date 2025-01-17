import {
    getResponseWithoutGroup,
    getPercentage,
    isARankingTally,
    isAClosedTally,
} from "../utils";
import { permanentOptionsList } from "../../../constants";

const parseClosedResult = (question, votesPerAns, includeWhiteNull) => {
    const noNullWhiteAns =
        includeWhiteNull ? votesPerAns.slice(0, -2) : votesPerAns;
    const nValidVotes = votesPerAns.reduce((n, a) => n + parseInt(a), 0);
    const nCastVotes = noNullWhiteAns.reduce((n, a) => n + parseInt(a), 0);
    let result = [];
    question.formal_options.forEach((answer, index) => {
        const obj = {
        Respuesta: answer,
        Votos: parseInt(votesPerAns[index]),
        PorcentajeSobreVotosValidos: getPercentage(
            votesPerAns[index],
            nValidVotes
        ),
        };
        if (permanentOptionsList.includes(answer)) {
        result.push(obj);
        } else {
        result.push({
            ...obj,
            PorcentajeSobreVotosEmitidos: getPercentage(
            votesPerAns[index],
            nCastVotes
            ),
        });
        }
    });
    return result;
};

const parseRankingResult = (question, result) => {
    const options_list = question['formal_options']
    const fixedJsonString = result
    .replace(/'/g, '"')
    .replace(/None/g, 'null')
    .replace(/\{([^{}"':]+):/g, '{"$1":')
    .replace(/, (\d+)(?=:)/g, ', "$1"');
    const jsObject = JSON.parse(fixedJsonString);

    jsObject['ncandidates'] = parseInt(question['total_options'], 10)
    jsObject['nwinners'] = parseInt(question['num_of_winners'], 10)
    jsObject['nrounds'] = Object.keys(jsObject['roundresumes']).length
    jsObject['winners'] = jsObject['winnerslist'].reduce((acc, winner_id) => {
        const id = parseInt(winner_id, 10)
        return [...acc, options_list[id]]
    }, [])

    return jsObject
};

export const parseResult = (question, result, includeWhiteNull) => {
    return isAClosedTally(question.tally_type)
    ? parseClosedResult(question, result, includeWhiteNull)
    : (
        isARankingTally(question.tally_type) 
        && parseRankingResult(question, result)
    )
};

const updateClosedResult = (result, question, percentageConfig) => {
    return result.reduce((accumulator, currentValue) => {
        const {
            PorcentajeSobreVotosValidos, PorcentajeSobreVotosEmitidos, Respuesta, Votos,
        } = currentValue

        const infoGeneral = {
            'Opción': question.q_type === "mixnet_question"
            ? getResponseWithoutGroup(Respuesta)
            : Respuesta,
            Votos,
        }

        if (percentageConfig === 'votosValidos') {
            accumulator.push({...infoGeneral, Porcentaje: PorcentajeSobreVotosValidos})
        }
        else if (percentageConfig === 'votosEmitidos' && PorcentajeSobreVotosEmitidos) {
            accumulator.push({...infoGeneral, Porcentaje: PorcentajeSobreVotosEmitidos})
        }
        else {
            accumulator.push(infoGeneral)
        }
        return accumulator
    }, [])
}

export const updateResult = (result, question, percentageConfig) => {
    return isAClosedTally(question.tally_type)
    ? updateClosedResult(result, question, percentageConfig)
    : isARankingTally(question.tally_type) && result
}